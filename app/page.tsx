"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import WorkshopScene from "@/components/workshop/WorkshopScene";
import HotspotModal from "@/components/modals/HotspotModal";
import CheatGuide from "@/components/CheatGuide";
import { type Hotspot } from "@/lib/hotspots-config";
import { GkLogo } from "@/components/GkLogo";
import { getProjects } from "@/lib/projects";
import BoringView from "@/components/resume/BoringView";
import { Gamepad2, FileText } from "lucide-react";

// ─── Custom Cursor ────────────────────────────────────────────────────────────
function CustomCursor({ color, activeTab }: { color: string | null; activeTab: string }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [clicked, setClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };
    const down = () => { setClicked(true); setTimeout(() => setClicked(false), 160); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mousedown", down); };
  }, [isVisible]);

  if (activeTab === "boring") return null;

  const isClickable = color !== null;
  const glowColor = isClickable ? "#ffd700" : "#2d5a3d";
  
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: 24, height: 24,
      border: `1.5px solid ${glowColor}`,
      borderRadius: "50%", pointerEvents: "none", zIndex: 10000,
      opacity: isVisible ? 1 : 0,
      transform: `translate(${pos.x - 12}px, ${pos.y - 12}px) scale(${clicked ? 0.8 : 1})`,
      transition: "transform 0.1s ease-out, border-color 0.2s, box-shadow 0.2s, opacity 0.3s",
      boxShadow: isClickable ? `0 0 16px ${glowColor}, inset 0 0 8px ${glowColor}40` : "none",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ width: 3, height: 3, background: glowColor, borderRadius: "50%" }} />
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const PROJECTS = getProjects();
const BIRTHDAY = new Date(2001, 7, 29);
const AGE = Math.floor((Date.now() - BIRTHDAY.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

const P = {
  bg: "#f6f8f3",
  surface: "#ffffff",
  border: "#dce5d6",
  pine: "#2d5a3d",
  text: "#1a2e1f",
  muted: "#5a7060",
  dim: "#9aaa94",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"fun" | "boring">("fun");
  const [active, setActive] = useState<Hotspot | null>(null);
  const [clickOrigin, setClickOrigin] = useState<{ x: number; y: number } | null>(null);
  const [highlightCategory, setHighlightCategory] = useState<string | null>(null);
  const [hoverSpot, setHoverSpot] = useState<Hotspot | null>(null);
  const [ready, setReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [isLit, setIsLit] = useState(false);
  const [logoPhase, setLogoPhase] = useState("initial");
  const sceneContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === "fun") {
      document.body.style.cursor = "none";
    } else {
      document.body.style.cursor = "default";
    }
    setReady(true);
    return () => { document.body.style.cursor = ""; };
  }, [activeTab]);

  return (
    <div style={{ background: P.surface, minHeight: "100vh", fontFamily: "var(--font-mono)" }}>
      {ready && <CustomCursor color={hoverSpot?.color ?? null} activeTab={activeTab} />}

      {/* ── SPLASH BACKDROP ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 110,
        background: isLit ? "#ffffff" : "#0a0f0a",
        opacity: splashDone ? 0 : 1,
        pointerEvents: splashDone ? "none" : "all",
        transition: "opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }} />

      {/* ── SHARED LOGO TRANSITION CONTAINER ── */}
      <LayoutGroup>
        <motion.div
          layout
          style={{
            position: "fixed",
            zIndex: 120,
            display: "flex",
            flexDirection: "column",
            alignItems: splashDone ? "flex-start" : "center",
            justifyContent: "center",
            top: splashDone ? "10px" : "50%",
            left: splashDone ? "24px" : "50%",
            transform: splashDone ? "translate(0, 0)" : "translate(-50%, -50%)",
            width: splashDone ? "clamp(120px, 15vw, 160px)" : "min(92vw, 940px)",
            pointerEvents: splashDone ? "none" : "all",
            margin: splashDone ? "0" : "auto"
          }}
          transition={{ 
            layout: { type: "spring", stiffness: 60, damping: 15 },
          }}
        >
          <motion.div layout style={{ width: "100%", display: "flex", justifyContent: splashDone ? "flex-start" : "center" }}>
            <div style={{ width: splashDone ? "100%" : "auto" }}>
              <GkLogo 
                isHeader={splashDone} 
                onComplete={() => setSplashDone(true)} 
                onLightMode={() => setIsLit(true)}
                onPhaseChange={setLogoPhase}
              />
            </div>
          </motion.div>
          
          <motion.div 
            layout
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: (logoPhase === "light_mode" || logoPhase === "final" || splashDone) ? 1 : 0,
              scale: splashDone ? 0.65 : 1,
              marginTop: splashDone ? "-6px" : "24px",
              originX: splashDone ? 0 : 0.5
            }}
            style={{
              textAlign: splashDone ? "left" : "center",
              width: splashDone ? "auto" : "100%",
              whiteSpace: "nowrap",
              color: splashDone ? P.muted : "#666",
              fontSize: "clamp(8px, 1vw, 12px)",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase"
            }}
          >
            by Alex Hofmann
          </motion.div>
        </motion.div>
      </LayoutGroup>

      {/* ── SITE CONTENT ── */}
      <div style={{
        opacity: splashDone ? 1 : 0,
        pointerEvents: splashDone ? "all" : "none",
        transition: "opacity 1s ease 0.8s",
      }} suppressHydrationWarning={true}>

        {/* ── HEADER ── */}
        <header style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          height: "60px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 clamp(16px, 4vw, 32px)",
          background: "rgba(255,255,255,0.7)",
          borderBottom: `1px solid ${P.border}`,
          backdropFilter: "blur(20px)",
        }}>
          {/* Logo spacer */}
          <div style={{ width: "clamp(140px, 20vw, 300px)" }} />

          {/* Tab Switcher in Header */}
          <div style={{ 
            display: "flex", 
            gap: "2px",
            background: "#f0f4ec", 
            padding: "2px", 
            borderRadius: "4px",
            border: `1px solid ${P.border}`,
            scale: "clamp(0.8, 1vw, 1)"
          }}>
            {[
              { id: "fun", label: "FUN", icon: <Gamepad2 size={12} /> },
              { id: "boring", label: "BORING", icon: <FileText size={12} /> }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px clamp(10px, 2vw, 20px)",
                  fontSize: "clamp(8px, 0.9vw, 9px)",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  borderRadius: "2px",
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: activeTab === t.id ? "#ff0000" : "transparent",
                  color: activeTab === t.id ? "#fff" : P.muted,
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "flex-end",
            width: "clamp(140px, 20vw, 300px)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
              <a href="https://github.com/switchhoff" target="_blank" className="social-link" title="GitHub" style={{ color: P.text, opacity: 0.8 }}>
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="20" height="20">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
              <a href="https://linkedin.com/in/hofmannalexb/" target="_blank" className="social-link" title="LinkedIn" style={{ color: P.text, opacity: 0.8 }}>
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="20" height="20">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.981 0 1.771-.773 1.771-1.729V1.729C24 .774 23.207 0 22.225 0z"/>
                </svg>
              </a>
            </div>
          </div>
        </header>

        <main style={{ paddingTop: "60px" }}>
          <AnimatePresence mode="wait">
            {activeTab === "fun" ? (
              <motion.section 
                key="fun"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.4 }}
                style={{ position: "relative", width: "100%", overflow: "hidden" }}
              >
                <div ref={sceneContainerRef} style={{ position: "relative" }}>
                  <WorkshopScene
                    onHotspotClick={(h, origin) => {
                      if (active?.id === h.id) { setActive(null); setClickOrigin(null); }
                      else { setActive(h); setClickOrigin(origin); }
                    }}
                    activeId={active?.id ?? null}
                    highlightCategory={highlightCategory}
                    onHoverChange={setHoverSpot}
                  />
                  <HotspotModal
                    hotspot={active}
                    clickOrigin={clickOrigin}
                    containerRect={sceneContainerRef.current?.getBoundingClientRect() ?? null}
                    onClose={() => { setActive(null); setClickOrigin(null); }}
                  />
                  <CheatGuide
                    onHotspotSelect={(h) => { setActive(h); setClickOrigin(null); }}
                    activeCategory={highlightCategory}
                    onCategoryChange={setHighlightCategory}
                  />
                </div>
              </motion.section>
            ) : (
              <motion.section
                key="boring"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <BoringView projects={PROJECTS} age={AGE} />
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
