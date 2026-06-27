import "styles/globals.css"
import { Form } from "./components/Form";
import { useEffect, useState, useRef } from "react";
import { Interview } from "./components/Interview";
import { Result } from "./components/Result";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";

interface SparkParticle {
    id: number;
    x: number;
    y: number;
    driftX: string;
    driftY: string;
    color: string;
}

function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [trailPosition, setTrailPosition] = useState({ x: 0, y: 0 });
    const [hovered, setHovered] = useState(false);
    const [hidden, setHidden] = useState(true);
    const [particles, setParticles] = useState<SparkParticle[]>([]);
    
    const lastSpawnPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setHidden(false);

            // Spawning particles trail based on distance moved (15px threshold)
            const dx = Math.abs(e.clientX - lastSpawnPos.current.x);
            const dy = Math.abs(e.clientY - lastSpawnPos.current.y);

            if (dx > 15 || dy > 15) {
                // Generate a random spark with colorful glow
                const colors = [
                    "bg-indigo-400/90 shadow-[0_0_8px_rgba(99,102,241,0.7)]",
                    "bg-purple-400/90 shadow-[0_0_8px_rgba(168,85,247,0.7)]",
                    "bg-emerald-400/90 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                ];
                const randomColor = colors[Math.floor(Math.random() * colors.length)]!;

                const newParticle: SparkParticle = {
                    id: Date.now() + Math.random(),
                    x: e.clientX,
                    y: e.clientY,
                    driftX: `${(Math.random() - 0.5) * 60}px`,
                    driftY: `${(Math.random() - 0.5) * 60}px`,
                    color: randomColor
                };

                // Keep at most 15 particles in DOM at any time for peak 60fps performance
                setParticles((prev) => [...prev.slice(-14), newParticle]);
                lastSpawnPos.current = { x: e.clientX, y: e.clientY };
            }
        };

        const handleMouseLeave = () => setHidden(true);
        const handleMouseEnter = () => setHidden(false);

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseenter", handleMouseEnter);

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target) return;
            
            const isInteractive = 
                target.tagName === "BUTTON" ||
                target.tagName === "A" ||
                target.tagName === "INPUT" ||
                target.tagName === "SELECT" ||
                target.tagName === "TEXTAREA" ||
                target.onclick ||
                target.closest("button") ||
                target.closest("a") ||
                window.getComputedStyle(target).cursor === "pointer";

            setHovered(!!isInteractive);
        };

        document.addEventListener("mouseover", handleMouseOver);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseenter", handleMouseEnter);
            document.removeEventListener("mouseover", handleMouseOver);
        };
    }, []);

    // Clean up expired particles automatically
    useEffect(() => {
        if (particles.length === 0) return;
        const timer = setTimeout(() => {
            setParticles((prev) => prev.slice(1));
        }, 550); 
        return () => clearTimeout(timer);
    }, [particles]);

    // Smooth trailing physics using linear interpolation
    useEffect(() => {
        let animationFrameId: number;

        const updateTrail = () => {
            setTrailPosition((prev) => {
                const dx = position.x - prev.x;
                const dy = position.y - prev.y;
                const ease = 0.16; 
                return {
                    x: prev.x + dx * ease,
                    y: prev.y + dy * ease,
                };
            });
            animationFrameId = requestAnimationFrame(updateTrail);
        };

        animationFrameId = requestAnimationFrame(updateTrail);
        return () => cancelAnimationFrame(animationFrameId);
    }, [position]);

    if (hidden) return null;

    return (
        <>
            {/* Particles Trail sparks */}
            {particles.map((p) => (
                <div
                    key={p.id}
                    className={`hidden md:block fixed pointer-events-none z-[9997] size-1.5 rounded-full mouse-spark ${p.color}`}
                    style={{
                        left: `${p.x}px`,
                        top: `${p.y}px`,
                        // Set drift variables for CSS keyframe animation
                        ["--drift-x" as any]: p.driftX,
                        ["--drift-y" as any]: p.driftY,
                    }}
                />
            ))}

            {/* Inner solid glowing spark */}
            <div
                className="hidden md:block fixed pointer-events-none z-[9999] size-2 rounded-full bg-indigo-400 shadow-md shadow-indigo-500/50 transition-transform duration-150"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: `translate3d(-50%, -50%, 0) scale(${hovered ? 1.4 : 1})`,
                }}
            />
            {/* Outer soft trailing halo */}
            <div
                className="hidden md:block fixed pointer-events-none z-[9998] rounded-full border transition-all duration-75 ease-out"
                style={{
                    left: `${trailPosition.x}px`,
                    top: `${trailPosition.y}px`,
                    width: hovered ? "46px" : "26px",
                    height: hovered ? "46px" : "26px",
                    backgroundColor: hovered ? "rgba(99, 102, 241, 0.06)" : "transparent",
                    borderColor: hovered ? "rgba(129, 140, 248, 0.6)" : "rgba(99, 102, 241, 0.25)",
                    boxShadow: hovered ? "0 0 15px rgba(99, 102, 241, 0.2)" : "none",
                    transform: `translate3d(-50%, -50%, 0)`,
                }}
            />
        </>
    );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/interview/:interviewId" element={<Interview />} />
        <Route path="/result/:interviewId" element={<Result />} />
      </Routes>
      <Toaster position="bottom-left" />
      <CustomCursor />
    </BrowserRouter>
  );
}

export default App;
