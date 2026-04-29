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
import AmbientPlayer from "@/components/workshop/AmbientPlayer";
import { Gamepad2, FileText } from "lucide-react";

// ─── Custom Cursor ────────────────────────────────────────────────────────────
function CustomCursor({ activeTab }: { activeTab: string }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [clicked, setClicked] = useState(false);
  const [bgColor, setBgColor] = useState("#f6f8f3");
  const [isClickable, setIsClickable] = useState(false);


  const isElementClickable = (el: Element | null): boolean => {
    if (!el) return false;
    const tagName = el.tagName.toLowerCase();

    // Direct clickable elements
    if (["button", "a", "input"].includes(tagName)) return true;
    if (el.hasAttribute("onclick")) return true;
    if (el.hasAttribute("role") && ["button", "link"].includes(el.getAttribute("role") || "")) return true;
    if (el.hasAttribute("data-clickable")) return true;

    // Check computed style for pointer cursor
    const style = window.getComputedStyle(el);
    if (style.cursor === "pointer") return true;

    // Check parent recursively (SVG paths, etc)
    if (el.parentElement) {
      const parent = el.parentElement;
      if (parent.hasAttribute("onclick") || parent.hasAttribute("role")) return true;
      return isElementClickable(parent);
    }

    return false;
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el) {
        const computed = window.getComputedStyle(el);
        const bgVal = computed.backgroundColor || "#f6f8f3";
        setBgColor(bgVal);
        setIsClickable(isElementClickable(el));
      }
    };
    const down = () => { setClicked(true); setTimeout(() => setClicked(false), 160); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mousedown", down); };
  }, []);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: 24, height: 24,
      border: isClickable ? `4px solid #ffd700` : `1px solid #000000`,
      borderRadius: "50%", pointerEvents: "none", zIndex: 10000,
      transform: `translate(${pos.x - 12}px, ${pos.y - 12}px) scale(${clicked ? 0.85 : 1})`,
      transition: "transform 0.1s ease-out, border 0.2s, box-shadow 0.2s",
      boxShadow: `0 0 0 2px #000000`,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ width: 6, height: 6, background: isClickable ? "#ffd700" : "#ffffff", borderRadius: "50%" }} />
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const PROJECTS = getProjects();
const BIRTHDAY = new Date(2001, 7, 29);
function computeAge() {
  return Math.floor((Date.now() - BIRTHDAY.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

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
  const [age] = useState(() => computeAge());
  const [isLit, setIsLit] = useState(false);
  const [logoPhase, setLogoPhase] = useState("initial");
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Persist dark mode across sessions; set mounted after first paint
  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored === "true") setDarkMode(true);
    setMounted(true);
  }, []);
  const sceneContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.style.cursor = "none";
    document.body.style.cursor = "none";
    document.body.style.pointerEvents = "auto";
    setReady(true);
    return () => {
      document.documentElement.style.cursor = "";
      document.body.style.cursor = "";
    };
  }, [activeTab]);

  const handleDarkModeToggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", String(next));
  };

  return (
    <div suppressHydrationWarning style={{
      background: darkMode ? "#1a1a1a" : "#ffffff",
      minHeight: "100vh",
      fontFamily: "var(--font-mono)",
      color: darkMode ? "#ffffff" : P.text,
      transition: "background 0.5s, color 0.5s"
    }}>
      {ready && <CustomCursor activeTab={activeTab} />}

      {/* ── SPLASH BACKDROP ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 110,
        background: darkMode ? "#000000" : (isLit ? "#ffffff" : "#0a0f0a"),
        opacity: splashDone ? 0 : 1,
        pointerEvents: splashDone ? "none" : "all",
        transition: "opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s",
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
            alignItems: "center",
            justifyContent: "center",
            inset: 0,
            pointerEvents: splashDone ? "none" : "all",
          }}
          transition={{
            layout: { type: "spring", stiffness: 60, damping: 15 },
          }}
        >
          <motion.div
            layout
            style={{
              position: splashDone ? "fixed" : "relative",
              top: splashDone ? "10px" : "auto",
              left: splashDone ? "24px" : "auto",
              width: splashDone ? "clamp(120px, 15vw, 160px)" : "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: splashDone ? 100 : "auto",
            }}
            animate={{
              scale: splashDone ? 1 : 1,
            }}
            transition={{
              layout: { type: "spring", stiffness: 60, damping: 15 },
            }}
          >
            <GkLogo
              isHeader={splashDone}
              onComplete={() => setSplashDone(true)}
              onLightMode={() => setIsLit(true)}
              onPhaseChange={setLogoPhase}
              onHeaderClick={handleDarkModeToggle}
            />
          </motion.div>
          
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{
              opacity: (logoPhase === "light_mode" || logoPhase === "final" || splashDone) ? 1 : 0,
            }}
            style={{
              display: splashDone ? "none" : "block",
              textAlign: "center",
              whiteSpace: "nowrap",
              color: "#666",
              fontSize: "clamp(8px, 1vw, 12px)",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              marginTop: "24px",
            }}
            transition={{
              layout: { type: "spring", stiffness: 60, damping: 15 },
            }}
          >
            by Alex Hofmann
          </motion.div>

        </motion.div>
      </LayoutGroup>

      {/* ── SPLASH PROMPT (centered independently from logo) ── */}
      {!splashDone && logoPhase === "initial" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 125,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: "68vh",
            pointerEvents: "none",
            gap: "12px",
          }}
        >
          <span style={{
            color: "#e0e0e0",
            fontSize: "clamp(10px, 1.2vw, 18px)",
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontFamily: "var(--font-mono)",
          }}>
            CLICK THE POWER BUTTON
          </span>
          <span style={{
            color: "#c0c0c0",
            fontSize: "clamp(8px, 0.9vw, 11px)",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "var(--font-mono)",
          }}>
            OR
          </span>
          <button
            onClick={() => setSplashDone(true)}
            style={{
              pointerEvents: "all",
              padding: "8px 20px",
              background: "transparent",
              border: "1px solid #ffffff",
              color: "#ffffff",
              fontSize: "clamp(7px, 0.9vw, 11px)",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "none",
              transition: "all 0.3s ease",
              borderRadius: "2px",
              fontFamily: "var(--font-mono)",
            }}
            onMouseEnter={(e) => {
              const t = e.currentTarget as HTMLButtonElement;
              t.style.borderColor = "#ffd700";
              t.style.color = "#ffd700";
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget as HTMLButtonElement;
              t.style.borderColor = "#ffffff";
              t.style.color = "#ffffff";
            }}
            data-clickable="true"
          >
            Skip
          </button>
        </motion.div>
      )}

      {/* ── SITE CONTENT ── */}
      <div style={{
        opacity: splashDone ? 1 : 0,
        pointerEvents: splashDone ? "all" : "none",
        transition: "opacity 1s ease 0.8s",
      }} suppressHydrationWarning={true}>

        {/* ── HEADER ── */}
        <header style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(1.5rem, 5vw, 4rem)",
          background: darkMode ? "rgba(26,26,26,0.9)" : "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          zIndex: 100,
          transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          {/* Logo spacer */}
          <div style={{ width: "clamp(140px, 20vw, 300px)" }} />

          {/* Tab Switcher in Header */}
          <div suppressHydrationWarning style={{
            position: "relative",
            display: "flex",
            background: mounted ? (darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)") : "rgba(0,0,0,0.06)",
            borderRadius: "14px",
            padding: "4px",
            border: `1px solid ${mounted ? (darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)") : "rgba(0,0,0,0.1)"}`,
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15)",
          }}>
            {/* Sliding pill indicator — only animate after mount to avoid SSR mismatch */}
            {mounted ? (
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                style={{
                  position: "absolute",
                  top: "4px",
                  bottom: "4px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #cc0000, #ff4444)",
                  boxShadow: "0 2px 12px rgba(200,0,0,0.4)",
                  left: activeTab === "fun" ? "4px" : "calc(50% + 2px)",
                  width: "calc(50% - 6px)",
                }}
              />
            ) : (
              <div style={{
                position: "absolute", top: "4px", bottom: "4px", borderRadius: "10px",
                background: "linear-gradient(135deg, #cc0000, #ff4444)",
                boxShadow: "0 2px 12px rgba(200,0,0,0.4)",
                left: "4px", width: "calc(50% - 6px)",
              }} />
            )}
            {[
              { id: "fun", label: "FUN", icon: <Gamepad2 size={14} /> },
              { id: "boring", label: "BORING", icon: <FileText size={14} /> }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "9px 22px",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  borderRadius: "10px",
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  transition: "color 0.2s",
                  color: activeTab === t.id
                    ? "#fff"
                    : (mounted && darkMode ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)"),
                  flex: 1,
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-mono)",
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
            width: "clamp(140px, 20vw, 300px)",
          }}>
            <button
              onClick={handleDarkModeToggle}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              {/* Lightbulb SVG */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                style={{ color: darkMode ? "#facc15" : "#9ca3af", transition: "color 0.3s" }}>
                <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-2.8C7.21 13.16 6 11.22 6 9a6 6 0 0 1 6-6z"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
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
                style={{ position: "relative", width: "100vw", height: "calc(100vh - 60px)", overflow: "hidden", background: darkMode ? "#111111" : "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              >
                {/* Shared container — fills viewport at 16:9 */}
                <div style={{
                  position: "relative",
                  width: "min(100vw, calc((100vh - 60px) * 16 / 9))",
                  height: "min(calc(100vh - 60px), calc(100vw * 9 / 16))",
                  aspectRatio: "16 / 9",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/OffswitchBKGHIGH.png"
                    alt="Background"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      objectPosition: "center",
                      pointerEvents: "none",
                    }}
                    draggable={false}
                  />
                  <div ref={sceneContainerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
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
                  </div>
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
                <BoringView projects={PROJECTS} age={age} darkMode={darkMode} />
              </motion.section>
            )}
          </AnimatePresence>
        </main>

        {/* AmbientPlayer — lives outside AnimatePresence so audio persists on tab switch */}
        <motion.div
          animate={{
            opacity: activeTab === "fun" ? 1 : 0,
            filter: activeTab === "fun" ? "blur(0px)" : "blur(10px)",
          }}
          transition={{ duration: 0.4 }}
          style={{
            position: "fixed",
            top: "60px",
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 15,
          }}
        >
          <div style={{
            position: "relative",
            width: "min(100vw, calc((100vh - 60px) * 16 / 9))",
            height: "min(calc(100vh - 60px), calc(100vw * 9 / 16))",
            pointerEvents: "none",
          }}>
            <AmbientPlayer darkMode={darkMode} />
          </div>
        </motion.div>



      </div>
    </div>
  );
}
