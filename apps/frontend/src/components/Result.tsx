import { BACKEND_URL } from "@/lib/config";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Bot, Loader2, Sparkles, User, Mic } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface ResultData {
    transcript: { type: "Assistant" | "User"; content: string; createdAt: string }[];
    score: number;
    feedback: string;
    status: "Done" | "InProgress" | "Pre";
}

export function Result() {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState<ResultData>({
        score: 0,
        feedback: "",
        transcript: [],
        status: "Pre",
    });

    useEffect(() => {
        const fetchResult = () =>
            axios.get(`${BACKEND_URL}/api/v1/result/${interviewId}`).then((response) => {
                setResult(response.data);
                return response.data.status as ResultData["status"];
            });

        fetchResult();
        const intervalId = setInterval(async () => {
            const s = await fetchResult();
            if (s === "Done") clearInterval(intervalId);
        }, 5000);

        return () => clearInterval(intervalId);
    }, [interviewId]);

    const ready = result.status === "Done";

    return (
        <main className="dark min-h-screen w-screen py-12 px-6 overflow-x-hidden bg-[#030306] text-zinc-100 selection:bg-indigo-500/30 selection:text-white flex flex-col font-sans antialiased relative">
            {/* Background glowing ambient blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

            {/* Logo Header */}
            <header className="mx-auto w-full max-w-3xl mb-8 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 flex items-center justify-center shadow-lg border border-white/10">
                        <Mic className="size-4.5 text-white" />
                    </div>
                    <span className="font-sans font-extrabold text-lg tracking-tight text-white">
                        interviewer<span className="text-indigo-400">.ai</span>
                    </span>
                </div>
                <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-xl font-semibold text-xs border-zinc-800 bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-colors" 
                    onClick={() => navigate("/")}
                >
                    New Interview
                </Button>
            </header>

            {/* Glassmorphic Report Card */}
            <div className="mx-auto w-full max-w-3xl border border-zinc-800 bg-zinc-955/80 shadow-2xl shadow-indigo-950/40 rounded-[32px] p-8 sm:p-12 backdrop-blur-xl flex-1 flex flex-col justify-between relative z-10">
                {/* Inner glowing core */}
                <div className="absolute inset-0 bg-radial-gradient from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between border-b border-zinc-900 pb-6 mb-8">
                        <div>
                            <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-white">
                                Interview <span className="italic font-normal text-indigo-400">results</span>
                            </h1>
                            <p className="mt-1.5 text-xs text-zinc-400 font-bold">
                                Real-time AI evaluation and conversational scorecard.
                            </p>
                        </div>
                        
                        {ready && (
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Overall Score</span>
                                <div className="flex items-baseline gap-1 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-2xl">
                                    <span className="text-3xl font-extrabold text-indigo-400 tracking-tight">
                                        {result.score}
                                    </span>
                                    <span className="text-xs text-indigo-300 font-semibold">/ 10</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {!ready ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                            <Loader2 className="size-8 animate-spin text-indigo-400" />
                            <div>
                                <p className="font-bold text-white">Analyzing your responses...</p>
                                <p className="mt-1 text-xs text-zinc-400 font-semibold">
                                    Gemini is currently evaluating your technical articulation. This takes a few seconds.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {/* Score + feedback */}
                            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 shadow-xl">
                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 tracking-wider uppercase mb-3">
                                    <Sparkles className="size-4 text-indigo-400" />
                                    AI Feedback Report
                                </div>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300 font-medium">
                                    {result.feedback}
                                </p>
                            </section>

                            {/* Transcript */}
                            <section className="space-y-4">
                                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                    Conversation Transcript
                                </h2>
                                <div className="flex flex-col gap-4">
                                    {result.transcript.length === 0 && (
                                        <p className="text-sm text-zinc-400 font-bold italic">
                                            No messages were recorded for this interview.
                                        </p>
                                    )}
                                    {result.transcript.map((m, i) => {
                                        const isAi = m.type === "Assistant";
                                        return (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "flex gap-3.5",
                                                    isAi ? "justify-start" : "flex-row-reverse",
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "grid size-8 shrink-0 place-items-center rounded-full text-white text-xs font-bold shadow-md border border-white/10",
                                                        isAi
                                                            ? "bg-gradient-to-br from-violet-400 to-indigo-600"
                                                            : "bg-gradient-to-br from-emerald-300 to-teal-600",
                                                    )}
                                                >
                                                    {isAi ? (
                                                        <Bot className="size-4" />
                                                    ) : (
                                                        <User className="size-4" />
                                                    )}
                                                </div>
                                                <div
                                                    className={cn(
                                                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-md font-medium border",
                                                        isAi
                                                            ? "rounded-tl-sm bg-zinc-900 border-zinc-800 text-zinc-200"
                                                            : "rounded-tr-sm bg-indigo-600/20 border-indigo-500/30 text-white",
                                                    )}
                                                >
                                                    {m.content}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
