import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabaseClient";
import { 
    ArrowRight, 
    Github, 
    Loader2, 
    Mic, 
    Sparkles, 
    Star, 
    Trophy, 
    Users, 
    ShieldCheck, 
    Lock, 
    Server, 
    Cpu, 
    Key, 
    ChevronRight, 
    Activity, 
    CheckCircle2 
} from "lucide-react";

export function Form() {
    const [github, setGithub] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const heroSectionRef = useRef<HTMLDivElement>(null);

    // Authentication States
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Fetch active session on mount
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }: any) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Successfully logged out.");
            setUser(null);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            toast.error("Please enter email and password");
            return;
        }

        setAuthLoading(true);
        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email: email.trim(),
                    password: password.trim(),
                });
                if (error) throw error;
                if (data?.session) {
                    toast.success("Account created successfully!");
                    setUser(data.user);
                    setShowLoginModal(false);
                } else {
                    toast.success("Registration successful! Check your email for verification link.");
                    setShowLoginModal(false);
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password: password.trim(),
                });
                if (error) throw error;
                toast.success("Welcome back! Login successful.");
                setUser(data.user);
                setShowLoginModal(false);
            }
        } catch (err: any) {
            toast.error(err.message || "An authentication error occurred.");
        } finally {
            setAuthLoading(false);
        }
    };

    // Smooth scroll to top input
    const scrollToInput = () => {
        heroSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
            inputRef.current?.focus();
        }, 800);
        toast.info("Scrolled to profile submission. Paste your GitHub URL to start!");
    };

    // Smooth scroll to specific sections
    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            const sectionName = id
                .replace("-section", "")
                .replace("services", "features")
                .replace("showcase", "target audience");
            toast.info(`Smooth scrolling to ${sectionName} section...`);
        }
    };

    // IntersectionObserver for scroll animations
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: "0px",
            threshold: 0.1,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                }
            });
        }, observerOptions);

        const revealElements = document.querySelectorAll(".reveal");
        revealElements.forEach((el) => observer.observe(el));

        return () => {
            revealElements.forEach((el) => observer.unobserve(el));
        };
    }, []);

    async function onSubmit() {
        if (!github.trim()) {
            toast.error("Please provide a valid GitHub URL");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/pre-interview`, {
                github: github.trim(),
                userId: user?.id || null,
                userEmail: user?.email || null,
            });
            toast.success("GitHub profile analyzed! Directing to voice session...");
            navigate(`/interview/${response.data.id}`);
        } catch (e) {
            toast.error("Something went wrong starting your interview. Please try again.");
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen w-full bg-[#030306] text-zinc-100 selection:bg-indigo-500/30 selection:text-white font-sans relative overflow-x-clip">
            
            {/* STACKED SECTION 1: HERO & INPUT (z-10) */}
            <section 
                ref={heroSectionRef} 
                className="relative md:sticky md:top-0 min-h-screen w-full flex flex-col justify-between bg-[#030306] z-10 border-b border-zinc-900/50"
            >
                {/* Background glowing ambient blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
                <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none" />
                <div className="absolute bottom-[10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-emerald-900/5 blur-[120px] pointer-events-none" />

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

                {/* Header / Floating Navbar */}
                <header className="mx-auto w-full max-w-7xl px-6 py-5 flex items-center justify-between relative z-50">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={scrollToInput}>
                        <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
                            <Mic className="size-4.5 text-white animate-pulse" />
                        </div>
                        <span className="font-sans font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                            interviewer<span className="text-indigo-400">.ai</span>
                            <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full px-2 py-0.5 ml-1.5 uppercase tracking-wider">v2.0</span>
                        </span>
                    </div>

                    {/* Desktop Menu Links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-400">
                        <button onClick={() => scrollToSection("how-it-works-section")} className="hover:text-white transition-colors cursor-pointer">How it works</button>
                        <button onClick={() => scrollToSection("services-section")} className="hover:text-white transition-colors cursor-pointer">Features</button>
                        <button onClick={() => scrollToSection("security-section")} className="hover:text-white transition-colors cursor-pointer">Security</button>
                        <button onClick={() => scrollToSection("showcase-section")} className="hover:text-white transition-colors cursor-pointer">Showcase</button>
                    </nav>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <span className="hidden sm:inline text-xs text-zinc-400 font-semibold max-w-[150px] truncate">
                                    {user.email}
                                </span>
                                <Button 
                                    variant="ghost" 
                                    onClick={handleSignOut}
                                    className="rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                                >
                                    Log Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => {
                                        setIsSignUp(false);
                                        setShowLoginModal(true);
                                    }}
                                    className="hidden sm:inline-flex rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                                >
                                    Log In
                                </Button>
                                <Button 
                                    onClick={scrollToInput}
                                    className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-sm font-semibold shadow-lg shadow-indigo-500/20 border border-indigo-500/30"
                                >
                                    Start Free
                                </Button>
                            </>
                        )}
                    </div>
                </header>

                {/* Central Hero Content */}
                <div className="relative flex-1 flex items-center justify-center px-6 py-16">
                    
                    {/* FLOATING DECORATIVE CARDS */}
                    {/* Card 1: AI Interviewer Active (Left Top) */}
                    <div className="hidden xl:block absolute left-[6%] top-[22%] reveal reveal-delay-100">
                        <div className="w-64 flex flex-col gap-2.5 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-2xl shadow-indigo-950/40 backdrop-blur-md animate-bounce [animation-duration:6s] hover:border-zinc-700 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="size-9 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs border border-white/10">
                                    AI
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Lead AI Evaluator</p>
                                    <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5">
                                        <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                                        Active voice session
                                    </p>
                                </div>
                            </div>
                            {/* Simulated visualizer wave */}
                            <div className="flex items-center gap-1 h-3 mt-1 pl-1">
                                <span className="w-1 bg-violet-500 rounded-full h-2 animate-pulse" />
                                <span className="w-1 bg-violet-400 rounded-full h-3 animate-pulse [animation-delay:0.2s]" />
                                <span className="w-1 bg-indigo-500 rounded-full h-1.5 animate-pulse [animation-delay:0.4s]" />
                                <span className="w-1 bg-violet-400 rounded-full h-3.5 animate-pulse [animation-delay:0.1s]" />
                                <span className="w-1 bg-emerald-400 rounded-full h-2 animate-pulse [animation-delay:0.3s]" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Rating/Review (Left Bottom) */}
                    <div className="hidden xl:block absolute left-[8%] bottom-[12%] reveal reveal-delay-300">
                        <div className="w-64 flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-2xl shadow-indigo-950/20 backdrop-blur-md hover:border-zinc-700 transition-colors">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                            <p className="text-[11px] leading-relaxed text-zinc-300 font-semibold italic">
                                "The evaluation was spot-on. It felt exactly like an interview with a principal engineer."
                            </p>
                            <div className="flex items-center gap-2 mt-1 border-t border-zinc-900 pt-2">
                                <div className="size-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[8px] font-bold text-indigo-300">
                                    S
                                </div>
                                <span className="text-[10px] font-bold text-zinc-400">Senior React Prep</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Technical Score Stats (Right Top) */}
                    <div className="hidden xl:block absolute right-[7%] top-[24%] reveal reveal-delay-200">
                        <div className="w-56 flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-2xl shadow-indigo-950/40 backdrop-blur-md animate-bounce [animation-duration:8s] hover:border-zinc-700 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Live Score</span>
                                <Trophy className="size-4 text-amber-400" />
                            </div>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl font-extrabold text-white">8.9</span>
                                <span className="text-xs text-zinc-400 font-bold">/ 10</span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5">
                                <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                                    +14% Code Quality
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Github Status (Right Bottom) */}
                    <div className="hidden xl:block absolute right-[8%] bottom-[15%] reveal reveal-delay-400">
                        <div className="w-64 flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-2xl shadow-indigo-950/30 backdrop-blur-md hover:border-zinc-700 transition-colors">
                            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                                <Sparkles className="size-4 text-indigo-400" />
                                <span>GitHub Repository Profiler</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-zinc-300 font-semibold">
                                Analyzed 12 repositories. Mapped dependencies, architecture, and coding patterns instantly.
                            </p>
                        </div>
                    </div>

                    {/* Central Hero Content */}
                    <div className="flex w-full max-w-2xl flex-col items-center text-center z-10">
                        
                        {/* Upper Badge */}
                        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3.5 py-1.5 text-xs font-bold text-indigo-400 shadow-xl">
                            <Sparkles className="size-3.5 text-indigo-400 animate-spin [animation-duration:4s]" />
                            100% Free AI Technical Interviewer
                        </span>

                        {/* Breathtaking Typography (Pinterest Serif Style) */}
                        <h1 className="font-serif text-5xl sm:text-7.5xl font-normal tracking-tight leading-[1.02] text-white">
                            Interviews <span className="italic font-normal text-indigo-400">meet</span> their <br className="hidden sm:inline" /> perfect candidate
                        </h1>
                        
                        {/* Subtitle */}
                        <p className="mt-6 max-w-md text-balance text-sm sm:text-base leading-relaxed text-zinc-400 font-medium">
                            Paste your GitHub profile. Experience a live, voice-driven interview tailored completely to your repositories. Get deep feedback instantly, completely for free.
                        </p>

                        {/* SaaS Input/Start Form */}
                        <div className="mt-10 w-full max-w-lg relative px-2">
                            <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-2 shadow-2xl shadow-indigo-500/5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-300">
                                <div className="flex items-center pl-3 text-zinc-400">
                                    <Github className="size-5" />
                                </div>
                                <Input
                                    ref={inputRef}
                                    value={github}
                                    placeholder="https://github.com/your-username"
                                    onChange={(e) => setGithub(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !loading && onSubmit()}
                                    disabled={loading}
                                    className="border-0 bg-transparent shadow-none h-11 text-sm focus-visible:ring-0 text-white font-semibold placeholder:text-zinc-500"
                                />
                                <Button
                                    disabled={loading}
                                    onClick={onSubmit}
                                    className="h-11 px-6 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-bold shrink-0 gap-2 shadow-lg shadow-indigo-500/20 border border-indigo-500/30 transition-all duration-200"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Analyzing
                                        </>
                                    ) : (
                                        <>
                                            Start
                                            <ArrowRight className="size-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                            
                            {/* Bullet trust list */}
                            <div className="mt-4 flex items-center justify-center gap-5 text-[11px] text-zinc-400 font-bold">
                                <span className="flex items-center gap-1.5">
                                    <ShieldCheck className="size-3.5 text-emerald-400" />
                                    No API key required
                                </span>
                                <span className="size-1 bg-zinc-800 rounded-full" />
                                <span className="flex items-center gap-1.5">
                                    <Users className="size-3.5 text-emerald-400" />
                                    Browser-native voice
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Down Indicator */}
                <div className="pb-8 flex flex-col items-center gap-2 animate-pulse text-zinc-500 hover:text-indigo-400 transition-colors cursor-pointer z-10" onClick={() => scrollToSection("services-section")}>
                    <span className="text-[10px] font-bold tracking-widest uppercase">Scroll Down to Explore</span>
                    <ChevronRight className="size-4 rotate-90" />
                </div>
            </section>

            {/* STACKED SECTION 2: COMPANY SERVICES (z-20) */}
            <section 
                id="services-section" 
                className="relative md:sticky md:top-0 min-h-screen w-full flex flex-col justify-center py-24 px-6 bg-[#04040a] z-20 border-t border-zinc-900/50 shadow-[0_-30px_60px_rgba(0,0,0,0.85)]"
            >
                <div className="max-w-7xl mx-auto w-full relative z-10">
                    {/* Section Header */}
                    <div className="flex flex-col items-center text-center mb-16 reveal">
                        <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 rounded-full mb-3">
                            Services / Услуги компании
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-serif text-white font-normal mb-4">
                            We build custom evaluation frameworks
                        </h2>
                        <p className="max-w-xl text-zinc-400 text-sm sm:text-base">
                            Our intelligent system scrapes, models, and interviews candidates based directly on their real production codebases.
                        </p>
                    </div>

                    {/* 3 Glassmorphic Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Card 1: Automated Assessment */}
                        <div className="reveal border border-zinc-800 bg-gradient-to-b from-zinc-900/40 to-zinc-950/60 p-8 rounded-2xl hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-950/10 transition-all duration-300 group">
                            <div className="size-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Cpu className="size-5" />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                                Assessment / Автоматизация
                            </span>
                            <h3 className="text-lg font-bold text-white mb-3">
                                Code Architecture Review
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Deep inspection of repository layouts, package compositions, design patterns, and code density. Replaces manual architectural screening instantly.
                            </p>
                        </div>

                        {/* Card 2: Skill Tokenization */}
                        <div className="reveal reveal-delay-100 border border-zinc-800 bg-gradient-to-b from-zinc-900/40 to-zinc-950/60 p-8 rounded-2xl hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-950/10 transition-all duration-300 group">
                            <div className="size-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Key className="size-5" />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                                Tokenization / Токенизация
                            </span>
                            <h3 className="text-lg font-bold text-white mb-3">
                                Developer Skill Profiling
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Converts commit history, PR quality, and documentation skills into cryptographic credentials. Makes hidden developer capabilities immediately visible.
                            </p>
                        </div>

                        {/* Card 3: AI Web Speech Agent */}
                        <div className="reveal reveal-delay-200 border border-zinc-800 bg-gradient-to-b from-zinc-900/40 to-zinc-950/60 p-8 rounded-2xl hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-300 group">
                            <div className="size-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Mic className="size-5" />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                                Webapp Speech / Разговор
                            </span>
                            <h3 className="text-lg font-bold text-white mb-3">
                                Natural Voice Interview
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                A browser-native voice and text simulator executing logical interview paths. Simulates pressure, problem solving, and design decisions flawlessly.
                            </p>
                        </div>
                    </div>

                    {/* Glow Element under the cards */}
                    <div className="mt-16 py-6 w-full flex justify-center reveal">
                        <div className="w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent relative">
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-2 rounded-full bg-indigo-400 animate-ping" />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-2 rounded-full bg-indigo-500" />
                        </div>
                    </div>
                </div>
            </section>

            {/* STACKED SECTION 3: CYBERSECURITY (z-30) */}
            <section 
                id="security-section"
                className="relative md:sticky md:top-0 min-h-screen w-full flex flex-col justify-center py-24 px-6 bg-[#050510] z-30 border-t border-zinc-900/50 shadow-[0_-30px_60px_rgba(0,0,0,0.85)]"
            >
                {/* Glow accent */}
                <div className="absolute right-0 top-1/4 w-80 h-80 rounded-full bg-indigo-900/5 blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto w-full relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Left Column: Interactive Audit Selectors */}
                        <div className="lg:col-span-6 flex flex-col gap-4 reveal">
                            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
                                Security Protocol / Кибербезопасность
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-serif text-white font-normal mb-2 leading-tight">
                                Information Security & Vulnerability Audits
                            </h2>
                            
                            <div className="flex flex-col gap-3 mt-6">
                                {[
                                    "Security audit of active telecom & API services",
                                    "Continuous configuration integrity testing",
                                    "Pre-screening background check & credentials audit",
                                    "Systematic analysis of potential code vulnerabilities"
                                ].map((text, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={scrollToInput}
                                        className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-indigo-500/40 hover:bg-zinc-900/80 transition-all duration-200 cursor-pointer flex items-center justify-between group"
                                    >
                                        <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                            {text}
                                        </span>
                                        <ChevronRight className="size-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Descriptions & Cyber lock */}
                        <div className="lg:col-span-6 flex flex-col gap-6 lg:pl-8 reveal reveal-delay-200">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="size-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/20">
                                    <Lock className="size-6 animate-pulse" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Secure Assessment Sandbox</h4>
                                    <p className="text-[11px] text-zinc-500">Fully compliant sandboxed evaluation pipeline</p>
                                </div>
                            </div>

                            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                                Our architecture isolates all third-party code. By leveraging advanced analytical sandboxing, we map dependencies without exposing proprietary models or API keys. Your source code stays fully protected and private.
                            </p>

                            <div className="p-5 rounded-xl bg-zinc-955 border border-zinc-800/50 text-xs text-zinc-400 leading-relaxed">
                                <strong>Note:</strong> We run 100% cost-free using Gemini free tiers. We never save raw source code on persistent disks, keeping your data entirely isolated and compliance-friendly.
                            </div>

                            {/* Buttons Row matching Pinterest layout */}
                            <div className="flex flex-wrap items-center gap-4 mt-4">
                                <Button 
                                    onClick={() => scrollToSection("how-it-works-section")}
                                    className="px-6 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white border border-indigo-500/30 shadow-lg shadow-indigo-950/40 transition-all duration-200"
                                >
                                    More Details / Подробнее
                                </Button>
                                <Button 
                                    onClick={scrollToInput}
                                    className="px-6 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white font-bold text-xs transition-all duration-200"
                                >
                                    Get Free Audit / Начать тест
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STACKED SECTION 4: DATA STORAGE (z-40) */}
            <section 
                id="showcase-section"
                className="relative md:sticky md:top-0 min-h-screen w-full flex flex-col justify-center py-24 px-6 bg-[#060616] z-40 border-t border-zinc-900/50 shadow-[0_-30px_60px_rgba(0,0,0,0.85)]"
            >
                <div className="max-w-7xl mx-auto w-full relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        
                        {/* Left Column: Explanations + Server Rack */}
                        <div className="lg:col-span-5 flex flex-col gap-6 reveal">
                            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
                                Data Storage / Хранилище данных
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-serif text-white font-normal mb-2 leading-tight">
                                Safe Ingestion & Structural Caching
                            </h2>
                            
                            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                                When you submit your GitHub profile, the engine ingests only public repository configurations and code structure mapping. Raw file systems are never cached permanently.
                            </p>

                            <div className="flex flex-col gap-3.5 my-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <span className="text-xs text-zinc-300">Absolute isolated caching of session metrics.</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <span className="text-xs text-zinc-300">Files are parsed on-the-fly and immediately garbage collected.</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <span className="text-xs text-zinc-300">Total capacity of decentralized cache exceeds 5,000 TB.</span>
                                </div>
                            </div>

                            {/* Interactive Server Rack Graphic */}
                            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center gap-6 shadow-2xl">
                                <div className="flex flex-col gap-2 shrink-0">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="w-24 h-5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between px-2 text-[6px] font-mono text-zinc-500">
                                            <div className="flex gap-1 items-center">
                                                <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                                                <span>SRV-0{i+1}</span>
                                            </div>
                                            <div className="flex gap-0.5">
                                                <span className="w-2 h-1 bg-indigo-500 rounded-2xs" />
                                                <span className="w-2 h-1 bg-zinc-700 rounded-2xs" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-white">Edge Node Cache active</h5>
                                    <p className="text-[10px] text-zinc-500 mt-1">High-speed distributed session replication for prompt, delay-free interviews.</p>
                                </div>
                            </div>

                            <div>
                                <Button 
                                    onClick={scrollToInput}
                                    className="px-6 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/40 transition-all duration-200"
                                >
                                    Ingest Profile / Подробнее
                                </Button>
                            </div>
                        </div>

                        {/* Right Column: Audience Target Flow (Pinterest diagonal flow) */}
                        <div className="lg:col-span-7 flex flex-col gap-6 lg:pl-10 reveal reveal-delay-200">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                                Audience Targets / Целевые аудитории
                            </span>
                            <h4 className="text-sm font-bold text-white mb-2">
                                Who is this optimized for?
                            </h4>

                            {/* Diagonal flows styled after Pinterest */}
                            <div className="flex flex-col gap-3 relative">
                                {/* Connector line behind */}
                                <div className="absolute left-6 top-6 bottom-6 w-px bg-zinc-900 pointer-events-none" />

                                {[
                                    {
                                        title: "Large Enterprises & Tech Corporations",
                                        desc: "Automate code reviews, evaluate system engineering candidates scaleably.",
                                        sub: "Крупные корпорации и предприятия"
                                    },
                                    {
                                        title: "High-growth Startups & Teams",
                                        desc: "Quick, cost-free technical screening to filter candidates with zero database overhead.",
                                        sub: "Стартапы и малые компании"
                                    },
                                    {
                                        title: "Individual Developers & Prep Students",
                                        desc: "Mock interview environment with rigorous conversational questions and live scores.",
                                        sub: "Индивидуальные пользователи"
                                    },
                                    {
                                        title: "Application Developers & API Architects",
                                        desc: "Assess integration depth, system design, security protocols, and architecture.",
                                        sub: "Разработчики приложений и сервисов"
                                    },
                                    {
                                        title: "Public Sector & Academic Labs",
                                        desc: "Verified skill credentials and anonymous evaluation schemas.",
                                        sub: "Государственные органы и организации"
                                    }
                                ].map((item, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={scrollToInput}
                                        className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/50 hover:bg-zinc-900/40 hover:border-zinc-800 transition-all duration-200 cursor-pointer flex gap-4 items-start relative z-10 group"
                                    >
                                        <div className="size-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 group-hover:border-indigo-500/40 shrink-0 transition-colors">
                                            <ChevronRight className="size-4.5 rotate-[-45deg] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-baseline gap-x-2">
                                                <h5 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                                                    {item.title}
                                                </h5>
                                                <span className="text-[10px] text-zinc-500 italic font-medium">{item.sub}</span>
                                            </div>
                                            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STACKED SECTION 5: TECHNICAL ENGINE GRID & FOOTER (z-50) */}
            <section 
                id="how-it-works-section"
                className="relative md:sticky md:top-0 min-h-screen w-full flex flex-col justify-between py-20 px-6 bg-[#030306] z-50 border-t border-zinc-900/50 shadow-[0_-30px_60px_rgba(0,0,0,0.85)]"
            >
                <div className="max-w-7xl mx-auto w-full relative z-10 flex-1 flex flex-col justify-center">
                    
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-16 reveal">
                        <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 rounded-full mb-3">
                            How It Works / Общий принцип работы
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-serif text-white font-normal mb-4">
                            The Distributed Consensus Engine
                        </h2>
                        <p className="max-w-xl text-zinc-400 text-sm sm:text-base">
                            A multi-layered consensus grading engine executing fully in the client browser, backed by high-speed serverless schemas.
                        </p>
                    </div>

                    {/* 2x3 Grid with 5 text blocks and 1 spinning graphics card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* Block 1: Distributed Nodes */}
                        <div className="reveal border border-zinc-800/80 bg-zinc-950/40 p-6 rounded-2xl flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/20 transition-all duration-300">
                            <div>
                                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">
                                    Distributed Network / Распределенная сеть
                                </span>
                                <h4 className="text-base font-bold text-white mb-3">Distributed Node Graph</h4>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Traverses code files on-the-fly and builds a functional complexity map, determining potential bottleneck zones and structural flaws.
                                </p>
                            </div>
                            <div className="h-px bg-zinc-900 my-4" />
                            <span className="text-[10px] text-zinc-500 font-semibold italic">Node isolation protocols active</span>
                        </div>

                        {/* Block 2: Encryption */}
                        <div className="reveal reveal-delay-100 border border-zinc-800/80 bg-zinc-955/40 p-6 rounded-2xl flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/20 transition-all duration-300">
                            <div>
                                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">
                                    Security / Шифрование данных
                                </span>
                                <h4 className="text-base font-bold text-white mb-3">AES-256 Code Encryption</h4>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Every code snippet loaded into memory is encrypted via TLS 1.3. Evaluation metrics are saved anonymously to avoid corporate metadata leakage.
                                </p>
                            </div>
                            <div className="h-px bg-zinc-900 my-4" />
                            <span className="text-[10px] text-zinc-500 font-semibold italic">Zero metadata trace log policy</span>
                        </div>

                        {/* Block 3: Metallic Spinning Gear Graphic */}
                        <div className="reveal reveal-delay-200 border border-zinc-800/80 bg-gradient-to-br from-indigo-950/10 via-zinc-955/40 to-emerald-950/10 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden group">
                            {/* Interactive glow effect */}
                            <div className="absolute inset-0 bg-radial-gradient from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                            
                            {/* Circular glowing wireframe ring */}
                            <div className="relative size-32 rounded-full border border-indigo-500/20 flex items-center justify-center animate-spin [animation-duration:15s] group-hover:border-indigo-400/40 transition-colors">
                                {/* Inner ring */}
                                <div className="size-24 rounded-full border border-purple-500/20 flex items-center justify-center animate-reverse [animation-duration:10s]">
                                    {/* Central dot */}
                                    <div className="size-16 rounded-full border border-emerald-500/25 flex items-center justify-center">
                                        <Activity className="size-6 text-indigo-400 animate-pulse" />
                                    </div>
                                </div>
                                
                                {/* Small decorative nodes */}
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2 rounded-full bg-indigo-500 border border-white/20" />
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 size-2 rounded-full bg-emerald-500 border border-white/20" />
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 size-2 rounded-full bg-purple-500 border border-white/20" />
                                <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 size-2 rounded-full bg-indigo-500 border border-white/20" />
                            </div>

                            <span className="text-[10px] font-bold text-indigo-300 mt-6 tracking-wider uppercase">Live Consensus Stream</span>
                        </div>

                        {/* Block 4: Replication */}
                        <div className="reveal border border-zinc-800/80 bg-zinc-950/40 p-6 rounded-2xl flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/20 transition-all duration-300">
                            <div>
                                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">
                                    Replication / Репликация данных
                                </span>
                                <h4 className="text-base font-bold text-white mb-3">Multi-Region Cache Sync</h4>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Fast database replication across global edge servers. Access your interview logs and comprehensive result rubrics from anywhere with zero latency.
                                </p>
                            </div>
                            <div className="h-px bg-zinc-900 my-4" />
                            <span className="text-[10px] text-zinc-500 font-semibold italic">99.99% Node availability</span>
                        </div>

                        {/* Block 5: Consensus Scoring */}
                        <div className="reveal reveal-delay-100 border border-zinc-800/80 bg-zinc-950/40 p-6 rounded-2xl flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/20 transition-all duration-300">
                            <div>
                                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">
                                    Consensus / Консенсусный механизм
                                </span>
                                <h4 className="text-base font-bold text-white mb-3">Multi-Model Scoring Consensus</h4>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Utilizes multiple specialized prompt routines inside Gemini to score syntax, algorithmic design, and architectural logic separately, outputting a highly accurate average.
                                </p>
                            </div>
                            <div className="h-px bg-zinc-900 my-4" />
                            <span className="text-[10px] text-zinc-500 font-semibold italic">Cross-referenced grading criteria</span>
                        </div>

                        {/* Block 6: Instant Data Access */}
                        <div className="reveal reveal-delay-200 border border-zinc-800/80 bg-zinc-950/40 p-6 rounded-2xl flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/20 transition-all duration-300">
                            <div>
                                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">
                                    Access / Доступ к данным
                                </span>
                                <h4 className="text-base font-bold text-white mb-3">Instant Result Dashboard</h4>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Explore interactive charts showing strength maps, code metrics, and spoken answers. Share customized HTML/Markdown feedback links with potential employers.
                                </p>
                            </div>
                            <div className="h-px bg-zinc-900 my-4" />
                            <span className="text-[10px] text-zinc-500 font-semibold italic">Exportable PDF/Markdown reports</span>
                        </div>
                    </div>

                    {/* Bottom CTA Area */}
                    <div className="mt-16 flex flex-col items-center gap-6 reveal">
                        <p className="max-w-md text-center text-xs text-zinc-400 leading-relaxed">
                            In summary, our system offers the most secure, high-fidelity prep platform, protecting intellectual property and maintaining total data compliance.
                        </p>
                        <Button 
                            onClick={scrollToInput}
                            className="px-8 h-12 rounded-xl bg-[#c0f040] text-black hover:bg-[#b0df30] font-bold text-xs transition-all duration-200 shadow-xl shadow-lime-950/10"
                        >
                            Start Free Session / Начать бесплатно
                        </Button>
                    </div>
                </div>

                {/* Footer at the very bottom of Section 5 */}
                <footer className="w-full border-t border-zinc-900/60 pt-10 pb-6 bg-transparent mt-12">
                    <div className="mx-auto max-w-7xl px-6 flex flex-col items-center gap-6">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            Interviews prepared for leading companies
                        </span>
                        
                        {/* Brand Logos Row */}
                        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-sm font-extrabold tracking-tight text-zinc-500 select-none">
                            <span className="font-sans hover:text-white transition-colors">Google</span>
                            <span className="font-serif italic hover:text-white transition-colors text-lg">stripe</span>
                            <span className="font-sans hover:text-white transition-colors">Microsoft</span>
                            <span className="font-serif hover:text-white transition-colors text-lg">airbnb</span>
                            <span className="font-sans hover:text-white transition-colors">Vercel</span>
                            <span className="font-serif italic hover:text-white transition-colors">OpenAI</span>
                        </div>

                        <div className="mt-8 pt-8 border-t border-zinc-900/80 w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-semibold">
                            <span>&copy; 2026 interviewer.ai. Open-source under MIT License.</span>
                            <div className="flex gap-6">
                                <button onClick={scrollToInput} className="hover:text-white transition-colors">Terms of Service</button>
                                <button onClick={scrollToInput} className="hover:text-white transition-colors">Privacy Policy</button>
                            </div>
                        </div>
                    </div>
                </footer>
            </section>

            {/* HIGH-FIDELITY LIVE INTERACTIVE LOGIN MODAL */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                    {/* Modal container */}
                    <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl shadow-indigo-500/5 flex flex-col gap-6">
                        
                        {/* Close button */}
                        <button 
                            onClick={() => setShowLoginModal(false)}
                            className="absolute right-6 top-6 size-8 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                            &times;
                        </button>

                        {/* Title */}
                        <div className="text-center">
                            <div className="mx-auto size-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                                <Lock className="size-5" />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                {isSignUp ? "Create your Account" : "Welcome Back"}
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">
                                {isSignUp 
                                    ? "Register for free to save your technical interview history." 
                                    : "Sign in to access your saved interview scorecard history."}
                            </p>
                        </div>

                        {/* Input form */}
                        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                                <input 
                                    type="email"
                                    value={email}
                                    required
                                    placeholder="candidate@example.com"
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold placeholder:text-zinc-600 transition-colors"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Password</label>
                                <input 
                                    type="password"
                                    value={password}
                                    required
                                    placeholder="••••••••"
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold placeholder:text-zinc-600 transition-colors"
                                />
                            </div>

                            <Button 
                                type="submit"
                                disabled={authLoading}
                                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2"
                            >
                                {authLoading && <Loader2 className="size-4 animate-spin" />}
                                {isSignUp ? "Sign Up" : "Sign In"}
                            </Button>
                        </form>

                        {/* Toggle links */}
                        <div className="text-center text-xs mt-1">
                            <span className="text-zinc-500">
                                {isSignUp ? "Already have an account? " : "Don't have an account yet? "}
                            </span>
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                            >
                                {isSignUp ? "Sign In" : "Create Account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
