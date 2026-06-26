import { BACKEND_URL } from "@/lib/config";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Bot, Loader2, PhoneOff, User, Mic } from "lucide-react";
import { Button } from "./ui/button";
import { VoiceOrb } from "./VoiceOrb";
import { toast } from "sonner";

type Status = "connecting" | "live" | "ending";

/** Attaches an analyser to a stream and returns a getter for its current 0..1 volume level. */
function createLevelMeter(ctx: AudioContext, stream: MediaStream) {
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);

    return () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            const v = (data[i]! - 128) / 128;
            sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        // Boost and clamp so normal speech fills most of the range.
        return Math.min(1, rms * 3.2);
    };
}

export function Interview() {
    const { interviewId } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState<Status>("connecting");
    const [aiLevel, setAiLevel] = useState(0);
    const [userLevel, setUserLevel] = useState(0);

    // Refs for state to avoid closure issues in async event handlers
    const statusRef = useRef<Status>("connecting");
    statusRef.current = status;

    const isAiSpeakingRef = useRef(false);

    // Resources to clean up
    const userStreamRef = useRef<MediaStream | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const rafRef = useRef<number | null>(null);
    const recognitionRef = useRef<any>(null);
    const aiSpeechIntervalRef = useRef<any>(null);

    // Helper: Speak text and call onEnd when done
    function speak(text: string, onEnd: () => void) {
        if (!("speechSynthesis" in window)) {
            toast("Text-to-speech is not supported in your browser.");
            onEnd();
            return;
        }

        window.speechSynthesis.cancel();
        if (aiSpeechIntervalRef.current) clearInterval(aiSpeechIntervalRef.current);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";

        // Find a natural sounding English voice if possible
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
            (v) =>
                v.lang.startsWith("en") &&
                (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Zira"))
        );
        utterance.voice = preferredVoice || voices.find((v) => v.lang.startsWith("en")) || null;

        isAiSpeakingRef.current = true;

        // Drive the AI volume visualizer
        aiSpeechIntervalRef.current = setInterval(() => {
            if (window.speechSynthesis.speaking) {
                setAiLevel(0.15 + Math.random() * 0.35);
            } else {
                setAiLevel(0);
                clearInterval(aiSpeechIntervalRef.current);
            }
        }, 100);

        utterance.onend = () => {
            setAiLevel(0);
            isAiSpeakingRef.current = false;
            clearInterval(aiSpeechIntervalRef.current);
            onEnd();
        };

        utterance.onerror = (e) => {
            console.error("Speech synthesis error:", e);
            setAiLevel(0);
            isAiSpeakingRef.current = false;
            clearInterval(aiSpeechIntervalRef.current);
            onEnd();
        };

        window.speechSynthesis.speak(utterance);
    }

    // Helper: Listen to user voice
    function listenForUser() {
        const recognition = recognitionRef.current;
        if (!recognition || statusRef.current !== "live" || isAiSpeakingRef.current) return;

        try {
            recognition.start();
        } catch (e) {
            console.error("Recognition start error:", e);
        }
    }

    useEffect(() => {
        let cancelled = false;

        // Force voices list to load in Chrome/Safari
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.getVoices();
        }

        (async () => {
            // 1. Initialize Microphone and Audio Level Meter for User
            let userMeter: (() => number) | null = null;
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }
                userStreamRef.current = stream;

                const audioCtx = new AudioContext();
                audioCtxRef.current = audioCtx;
                userMeter = createLevelMeter(audioCtx, stream);

                // Drive the user volume visualizer
                const tick = () => {
                    if (userMeter) setUserLevel(userMeter());
                    rafRef.current = requestAnimationFrame(tick);
                };
                rafRef.current = requestAnimationFrame(tick);
            } catch (err) {
                console.error("Microphone access error:", err);
                toast("Could not access microphone. Please check your permissions.");
            }

            // 2. Initialize Browser Speech Recognition
            const SpeechRecognition =
                (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (!SpeechRecognition) {
                toast("Speech recognition is not supported in this browser. Chrome or Edge is recommended.");
            } else {
                const rec = new SpeechRecognition();
                rec.continuous = false;
                rec.interimResults = false;
                rec.lang = "en-US";

                rec.onresult = async (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    if (transcript && transcript.trim() && statusRef.current === "live") {
                        console.log("Candidate response:", transcript);
                        // Send response and get next question
                        try {
                            const res = await axios.post(`${BACKEND_URL}/api/v1/session/chat/${interviewId}`, {
                                message: transcript,
                            });
                            const nextQuestion = res.data.message;
                            speak(nextQuestion, () => {
                                listenForUser();
                            });
                        } catch (err) {
                            console.error("Error sending response:", err);
                            toast("Failed to get response from interviewer.");
                            // Retry listening
                            listenForUser();
                        }
                    }
                };

                rec.onerror = (event: any) => {
                    console.warn("Speech recognition warning/error:", event.error);
                    // Handle silence/no-speech gracefully by restarting
                    if (event.error === "no-speech" && statusRef.current === "live" && !isAiSpeakingRef.current) {
                        listenForUser();
                    }
                };

                rec.onend = () => {
                    // Automatically restart listening if AI is not speaking and we are still live
                    setTimeout(() => {
                        if (statusRef.current === "live" && !isAiSpeakingRef.current) {
                            listenForUser();
                        }
                    }, 500);
                };

                recognitionRef.current = rec;
            }

            // 3. Contact Backend to Start Interview
            try {
                const res = await axios.post(`${BACKEND_URL}/api/v1/session/start/${interviewId}`);
                if (cancelled) return;

                setStatus("live");
                const firstQuestion = res.data.message;

                // Welcome user and speak the first question, then start listening
                speak(firstQuestion, () => {
                    listenForUser();
                });
            } catch (err) {
                console.error("Error starting interview:", err);
                toast("Failed to start the interview session. Please try again.");
                setStatus("connecting");
            }
        })();

        return () => {
            cancelled = true;
            cleanup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interviewId]);

    function cleanup() {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (aiSpeechIntervalRef.current) clearInterval(aiSpeechIntervalRef.current);

        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        try {
            if (recognitionRef.current) {
                recognitionRef.current.onend = null;
                recognitionRef.current.onerror = null;
                recognitionRef.current.onresult = null;
                recognitionRef.current.abort();
            }
        } catch (e) {
            console.error("Recognition cleanup error:", e);
        }

        userStreamRef.current?.getTracks().forEach((t) => t.stop());
        audioCtxRef.current?.close().catch(() => {});
    }

    function endInterview() {
        setStatus("ending");
        cleanup();
        navigate(`/result/${interviewId}`);
    }

    const aiSpeaking = aiLevel > 0.05;
    const userSpeaking = userLevel > 0.05 && !aiSpeaking;

    return (
        <main className="dark min-h-screen w-screen flex flex-col justify-between bg-[#030306] text-zinc-100 selection:bg-indigo-500/30 selection:text-white font-sans antialiased relative overflow-hidden">
            {/* Background glowing ambient blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

            {/* Header / Navbar */}
            <header className="mx-auto w-full max-w-7xl px-6 py-5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 flex items-center justify-center shadow-lg border border-white/10">
                        <Mic className="size-4.5 text-white" />
                    </div>
                    <span className="font-sans font-extrabold text-lg tracking-tight text-white">
                        interviewer<span className="text-indigo-400">.ai</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                        Session ID: {interviewId?.slice(0, 8)}...
                    </span>
                </div>
            </header>

            {/* Main Stage Panel (Zoom/Meet Premium Style) */}
            <section className="flex-1 flex items-center justify-center px-6 py-4 relative z-10">
                <div className="w-full max-w-4xl h-[68vh] rounded-[32px] border border-zinc-800 bg-zinc-955/80 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl flex flex-col justify-between p-8 sm:p-12 relative overflow-hidden">
                    {/* Inner glowing core */}
                    <div className="absolute inset-0 bg-radial-gradient from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

                    {/* Header Inside Call Panel */}
                    <div className="flex items-center justify-between w-full border-b border-zinc-900 pb-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                            <span className="relative flex size-2">
                                <span
                                    className={
                                        status === "live"
                                            ? "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
                                            : "hidden"
                                    }
                                />
                                <span
                                    className={
                                        "relative inline-flex size-2 rounded-full " +
                                        (status === "live" ? "bg-emerald-400" : "bg-amber-400")
                                    }
                                />
                            </span>
                            {status === "connecting" ? (
                                <span className="text-zinc-400 animate-pulse">Initializing audio streams...</span>
                             ) : status === "ending" ? (
                                <span className="text-indigo-400">Generating evaluation scorecard...</span>
                            ) : (
                                <span className="text-emerald-400 font-bold uppercase tracking-wider">Live Voice Session</span>
                            )}
                        </div>
                        <span className="text-xs text-zinc-500 font-bold">Safe & Secure Channel</span>
                    </div>

                    {/* Orbs Area */}
                    <div className="flex-1 flex items-center justify-center py-6">
                        {status === "connecting" ? (
                            <div className="flex flex-col items-center gap-4 text-zinc-400 text-center">
                                <Loader2 className="size-8 animate-spin text-indigo-400" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-white">Connecting to AI Interviewer</p>
                                    <p className="text-xs font-medium text-zinc-500">Please allow microphone access when prompted...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex w-full max-w-3xl items-center justify-center gap-12 sm:gap-28">
                                <VoiceOrb
                                    level={aiLevel}
                                    speaking={aiSpeaking}
                                    label="Lead AI Evaluator"
                                    sublabel="Synthesizing speech"
                                    icon={Bot}
                                    accent="violet"
                                />
                                <VoiceOrb
                                    level={userLevel}
                                    speaking={userSpeaking}
                                    label="You (Candidate)"
                                    sublabel="Microphone active"
                                    icon={User}
                                    accent="emerald"
                                />
                            </div>
                        )}
                    </div>

                    {/* Control Bar Inside Call Panel */}
                    <div className="flex justify-center border-t border-zinc-900 pt-4">
                        <Button
                            variant="destructive"
                            onClick={endInterview}
                            disabled={status === "ending"}
                            className="h-12 px-8 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-2.5 shadow-lg shadow-red-950/40 border border-red-500/30 transition-all duration-200"
                        >
                            {status === "ending" ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Wrapping Up
                                </>
                            ) : (
                                <>
                                    <PhoneOff className="size-4" />
                                    End Interview
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Invisible footer to balance height */}
            <div className="h-8" />
        </main>
    );
}
