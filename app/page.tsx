"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WorkshopScene from "@/components/workshop/WorkshopScene";
import { type Hotspot, hotspots } from "@/lib/hotspots";
import { GkLogo } from "@/components/GkLogo";

// ─── Custom Cursor ────────────────────────────────────────────────────────────
function CustomCursor({ color }: { color: string | null }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [clicked, setClicked] = useState(false);
  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const down = () => { setClicked(true); setTimeout(() => setClicked(false), 160); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mousedown", down); };
  }, []);

  const c = color ?? "#2d5a3d";
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: 24, height: 24,
      border: `1.2px solid ${c}`,
      borderRadius: "50%", pointerEvents: "none", zIndex: 10000,
      transform: `translate(${pos.x - 12}px, ${pos.y - 12}px) scale(${clicked ? 0.7 : 1})`,
      transition: "transform 0.1s ease-out, border-color 0.2s, background 0.2s",
      background: clicked ? `${c}20` : "transparent",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ width: 2, height: 2, background: c, borderRadius: "50%" }} />
    </div>
  );
}

const HotspotCard = ({ h, active, onSelect }: { h: Hotspot, active: boolean, onSelect: () => void }) => {
  return (
    <div 
      onClick={onSelect}
      style={{
        padding: "16px",
        background: active ? "#ffffff" : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? h.color : "rgba(0,0,0,0.08)"}`,
        borderLeft: `3px solid ${h.color}`,
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: active ? 1 : 0.7,
        transform: active ? "scale(1.02)" : "scale(1)",
        boxShadow: active ? "0 10px 25px rgba(0,0,0,0.05)" : "none",
        position: "relative"
      }}
    >
      <div style={{ fontSize: "9px", fontWeight: 700, color: h.color, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>
        {h.label}
      </div>
      <div style={{ fontSize: "14px", fontWeight: 600, color: active ? "#111" : "#555", marginBottom: active ? "10px" : "0" }}>
        {h.panelContent.title}
      </div>
      
      {active && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          style={{ overflow: "hidden" }}
        >
          <p style={{ fontSize: "11px", color: "#666", lineHeight: 1.7, marginBottom: "14px", whiteSpace: "pre-wrap" }}>
            {h.panelContent.body}
          </p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {h.panelContent.tags.map(t => (
              <span key={t} style={{ 
                fontSize: "8px", 
                padding: "2px 8px", 
                background: "#f1f5f9", 
                borderRadius: "4px", 
                color: "#64748b",
                border: "1px solid #e2e8f0"
              }}>
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const PROJECTS = [
  { id: "portfolio", name: "Portfolio", tagline: "This portfolio — isometric workshop, point-and-click", tags: ["Next.js", "TypeScript", "Three.js"], color: "#3a5fbf", github: "https://github.com/switchhoff/Portfolio" },
  { id: "pawsbutton", name: "PawsButton", tagline: "TODO: Project description", tags: ["TODO"], color: "#e67e22", github: "https://github.com/switchhoff/PawsButton" },
  { id: "benfl", name: "BeNFL", tagline: "TODO: Project description", tags: ["TODO"], color: "#27ae60", github: "https://github.com/switchhoff/BeNFL" },
  { id: "minimise", name: "MiniMise", tagline: "Android launcher for intentional phone use", tags: ["Android", "Kotlin", "UX"], color: "#7a5ce0", github: "https://github.com/switchhoff/MiniMise" },
  { id: "habitat", name: "Habitat", tagline: "Habit tracker — streaks, intent, accountability", tags: ["Mobile", "TypeScript", "UX"], color: "#2d6fa3", github: "https://github.com/switchhoff/Habitat" },
  { id: "cavedisto", name: "CaveDisto", tagline: "Cave Disto laser measuring hardware system", tags: ["Firmware", "Hardware", "Optics"], color: "#b85c3a", github: "https://github.com/switchhoff/CaveDisto" },
  { id: "lastyear", name: "LastYear", tagline: "TODO: Project description", tags: ["TODO"], color: "#c0392b", github: "https://github.com/switchhoff/LastYear" },
  { id: "sixclicks", name: "SixClicks", tagline: "TODO: Project description", tags: ["TODO"], color: "#16a085", github: "https://github.com/switchhoff/SixClicks" },
  { id: "bintherestore", name: "BinThereStoreThat", tagline: "RFID-indexed workshop storage & retrieval", tags: ["IoT", "Hardware", "Web"], color: "#2d8a50", github: "https://github.com/switchhoff/BinThereStoreThat" },
  { id: "threadquarters", name: "Threadquarters", tagline: "TODO: Project description", tags: ["TODO"], color: "#8e44ad", github: "https://github.com/switchhoff/Threadquarters" },
  { id: "keysborough", name: "Keysborough-District", tagline: "TODO: Project description", tags: ["TODO"], color: "#2c3e50", github: "https://github.com/switchhoff/Keysborough-District" },
];

const WORK = [
  { title: "Chief Engineer", company: "Fortifyedge", period: "2024 — Present", note: "Defence tech. Full-system ownership." },
  { title: "Engineer", company: "Tonbo Systems", period: "2023", note: "Thermal imaging & sensor integration." },
  { title: "R&D Engineer", company: "DefendTex", period: "2022 — 2023", note: "Navigation of Unmanned Ground Vehicles." },
];

const P = {
  bg: "#f6f8f3",
  surface: "#ffffff",
  border: "#dce5d6",
  pine: "#2d5a3d",
  text: "#1a2e1f",
  muted: "#5a7060",
  dim: "#9aaa94",
};

// ─── Input style helper ───────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  border: `1px solid ${P.border}`, background: P.surface,
  fontSize: "12px", color: P.text, fontFamily: "var(--font-mono)",
  outline: "none", transition: "border-color 0.15s",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [active, setActive] = useState<Hotspot | null>(null);
  const [hoverSpot, setHoverSpot] = useState<Hotspot | null>(null);
  const [ready, setReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [isLit, setIsLit] = useState(false);

  // Contact form
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    document.body.style.cursor = "none";
    setReady(true);
    return () => { document.body.style.cursor = ""; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFormError("");
    try {
      const res = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { setSent(true); }
      else { setFormError("Something went wrong. Email alex@hoffswitch.com directly."); }
    } catch {
      setFormError("Connection error. Email alex@hoffswitch.com directly.");
    } finally { setSending(false); }
  };

  return (
    <div style={{ background: P.surface, minHeight: "100vh", fontFamily: "var(--font-mono)" }}>
      {ready && <CustomCursor color={hoverSpot?.color ?? null} />}

      {/* ── SPLASH BACKDROP ── covers site until logo animation completes */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 45,
        background: isLit ? "#ffffff" : "#0a0f0a",
        opacity: splashDone ? 0 : 1,
        pointerEvents: splashDone ? "none" : "all",
        transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }} />

      {/* ── OFFSWITCH LOGO — splash screen → nav ── */}
      <div style={{
        position: "fixed", zIndex: 50,
        pointerEvents: "none",
        ...(splashDone
          ? { top: "12px", left: "36px", width: "160px", transform: "none" }
          : { top: "50%", left: "50%", width: "min(92vw, 820px)", transform: "translate(-50%,-50%)" }
        ),
        transition: [
          "top    0.8s cubic-bezier(0.4,0,0.2,1)",
          "left   0.8s cubic-bezier(0.4,0,0.2,1)",
          "width  0.8s cubic-bezier(0.4,0,0.2,1)",
          "transform 0.8s cubic-bezier(0.4,0,0.2,1)",
        ].join(", "),
      }}>
        <div style={{ pointerEvents: "all" }}>
          <GkLogo 
            isHeader={splashDone} 
            onComplete={() => setSplashDone(true)} 
            onLightMode={() => setIsLit(true)}
          />
        </div>
        {splashDone && (
          <div className="mt-1 ml-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">by alex hofmann</span>
          </div>
        )}
      </div>

      {/* ── SITE CONTENT — fades in after splash ── */}
      <div style={{
        opacity: splashDone ? 1 : 0,
        pointerEvents: splashDone ? "all" : "none",
        transition: "opacity 0.6s ease 0.25s",
      }} suppressHydrationWarning={true}>

        {/* ── NAV ── */}
        <header style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 30,
          height: "52px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 36px",
          background: "rgba(255,255,255,0.92)",
          borderBottom: `1px solid ${P.border}`,
          backdropFilter: "blur(10px)",
        }}>
          {/* Logo occupies this space — spacer keeps right-side content aligned */}
          <div style={{ width: "220px" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#3a9e5c", boxShadow: "0 0 6px #3a9e5c", animation: "pulse 2.5s ease-in-out infinite" }} />
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
              <span style={{ fontSize: "9px", letterSpacing: "0.14em", color: P.dim, textTransform: "uppercase" }}>Available</span>
            </div>
            {[
              { title: "GitHub", href: "https://github.com/switchhoff", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg> },
              { title: "LinkedIn", href: "https://linkedin.com/in/switchhoff", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
            ].map(s => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" title={s.title}
                style={{ color: P.dim, display: "flex", alignItems: "center", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = P.pine)}
                onMouseLeave={e => (e.currentTarget.style.color = P.dim)}>
                {s.icon}
              </a>
            ))}
          </div>
        </header>

        {/* ── HERO — 3-Column Dashboard Layout ── */}
        <section style={{ paddingTop: "80px", paddingBottom: "60px", maxWidth: "1600px", margin: "0 auto", paddingLeft: "36px", paddingRight: "36px" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "300px 1fr 300px", 
            gap: "40px", 
            alignItems: "start" 
          }}>
            
            {/* COLUMN 1: LEFT CARDS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {hotspots.filter((_, i) => i % 2 === 0).map(h => (
                <HotspotCard key={h.id} h={h} active={active?.id === h.id} onSelect={() => setActive(active?.id === h.id ? null : h)} />
              ))}
            </div>

            {/* COLUMN 2: CENTER VIEWPORT */}
            <div style={{ position: "relative" }}>
              <div style={{ 
                width: "100%", 
                maxWidth: "800px", 
                margin: "0 auto",
                border: `1px solid ${P.border}`,
                borderRadius: "12px",
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)"
              }}>
                <WorkshopScene
                  onSelect={setActive}
                  activeId={active?.id ?? null}
                  onHoverChange={setHoverSpot}
                />
              </div>

              <div style={{
                position: "absolute", top: "-40px", left: "0", right: "0",
                display: "flex", justifyContent: "center",
                pointerEvents: "none",
              }}>
                <div style={{ fontSize: "9px", color: P.dim, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500 }}>
                  Active Workspace Context
                </div>
              </div>
            </div>

            {/* COLUMN 3: RIGHT CARDS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {hotspots.filter((_, i) => i % 2 !== 0).map(h => (
                <HotspotCard key={h.id} h={h} active={active?.id === h.id} onSelect={() => setActive(active?.id === h.id ? null : h)} />
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "96px 36px 80px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "48px" }}>
            <div style={{ width: 24, height: 1, background: P.pine, opacity: 0.5 }} />
            <span style={{ fontSize: "9px", letterSpacing: "0.2em", color: P.muted, textTransform: "uppercase" }}>About</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "start" }}>
            {/* Bio */}
            <div>
              <p style={{ fontSize: "clamp(15px,1.6vw,19px)", color: P.text, lineHeight: 1.85, fontWeight: 400, marginBottom: "28px" }}>
                I'm a 24-year-old engineer who builds systems from first principles — firmware on microcontrollers to full-stack web platforms, laser-cut enclosures to cloud automation pipelines.
              </p>
              <p style={{ fontSize: "13px", color: P.muted, lineHeight: 1.9, marginBottom: "28px" }}>
                Background in defence R&D across Australia and India. Currently seeking a Forward Deployed Engineer role where I can operate at the intersection of deep technical work and direct customer impact.
              </p>
              <p style={{ fontSize: "13px", color: P.muted, lineHeight: 1.9 }}>
                When I'm not shipping code or soldering, I'm adding to the Multiboard wall, printing brackets at 3am, or running automations I don't technically need but definitely wanted.
              </p>
            </div>

            {/* Education + Experience */}
            <div style={{ display: "flex", flexDirection: "column", gap: "44px" }}>
              {/* Education */}
              <div>
                <div style={{ fontSize: "8px", letterSpacing: "0.2em", color: P.dim, textTransform: "uppercase", marginBottom: "16px" }}>Education</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { degree: "Master of Electrical Engineering", detail: "Monash University" },
                    { degree: "Bachelor of Mechatronics & Robotics Engineering (AI)", detail: "Monash University · AI Specialisation" },
                    { degree: "Minor — Software Engineering", detail: "" },
                  ].map((e, i) => (
                    <div key={i} style={{
                      padding: "12px 16px",
                      border: `1px solid ${P.border}`,
                      borderLeft: `2px solid ${P.pine}`,
                      background: P.surface,
                    }}>
                      <div style={{ fontSize: "12px", fontWeight: 500, color: P.text, marginBottom: e.detail ? "3px" : 0 }}>
                        {e.degree}
                      </div>
                      {e.detail && <div style={{ fontSize: "10px", color: P.dim }}>{e.detail}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <div style={{ fontSize: "8px", letterSpacing: "0.2em", color: P.dim, textTransform: "uppercase", marginBottom: "16px" }}>Experience</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {WORK.map((w, i) => (
                    <div key={i} style={{
                      display: "flex", gap: "16px",
                      padding: "16px 0",
                      borderBottom: i < WORK.length - 1 ? `1px solid ${P.border}` : "none",
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "5px" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", border: `1.5px solid ${P.pine}`, background: P.bg, flexShrink: 0 }} />
                        {i < WORK.length - 1 && <div style={{ width: 1, flex: 1, background: P.border, marginTop: 4 }} />}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "7px", marginBottom: "2px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "12px", fontWeight: 500, color: P.text }}>{w.title}</span>
                          <span style={{ fontSize: "10px", color: P.pine }}>@ {w.company}</span>
                        </div>
                        <div style={{ fontSize: "9px", color: P.dim, letterSpacing: "0.06em", marginBottom: "3px" }}>{w.period}</div>
                        <div style={{ fontSize: "11px", color: P.muted }}>{w.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 36px" }}>
          <div style={{ height: 1, background: P.border }} />
        </div>

        {/* ── PROJECTS ── */}
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 36px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: 24, height: 1, background: P.pine, opacity: 0.5 }} />
              <span style={{ fontSize: "9px", letterSpacing: "0.2em", color: P.muted, textTransform: "uppercase" }}>Projects</span>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
            gap: "1px", background: P.border,
            border: `1px solid ${P.border}`,
          }}>
            {PROJECTS.map(proj => (
              <div key={proj.id}
                style={{ background: P.surface, padding: "22px", position: "relative", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = P.bg)}
                onMouseLeave={e => (e.currentTarget.style.background = P.surface)}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: proj.color }} />
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: P.text, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                    {proj.name}
                  </div>
                  <a href={proj.github} target="_blank" rel="noopener noreferrer"
                    title="View on GitHub"
                    style={{ color: P.dim, flexShrink: 0, marginLeft: 8, transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = proj.color)}
                    onMouseLeave={e => (e.currentTarget.style.color = P.dim)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </a>
                </div>
                <div style={{ fontSize: "12px", color: P.muted, lineHeight: 1.65, marginBottom: "14px" }}>{proj.tagline}</div>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {proj.tags.map(t => (
                    <span key={t} style={{
                      fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase",
                      padding: "2px 6px", border: `1px solid ${P.border}`, color: P.dim,
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 36px" }}>
          <div style={{ height: 1, background: P.border }} />
        </div>

        {/* ── CONTACT ── */}
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 36px 100px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "start" }}>

            {/* Left — heading + icons */}
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: P.muted, textTransform: "uppercase", marginBottom: "14px" }}>Contact</div>
              <h2 style={{ fontSize: "clamp(22px,2.8vw,36px)", fontWeight: 600, color: P.text, letterSpacing: "-0.025em", lineHeight: 1.2, marginBottom: "28px" }}>
                Let's build something.
              </h2>
              <div style={{ display: "flex", gap: "10px" }}>
                {[
                  { title: "GitHub", href: "https://github.com/alexhofmann", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg> },
                  { title: "LinkedIn", href: "https://linkedin.com/in/alexhofmann", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
                  { title: "Email", href: "mailto:alex@hoffswitch.com", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" /></svg> },
                ].map(s => (
                  <a key={s.href} href={s.href}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer" title={s.title}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 44, height: 44,
                      border: `1px solid ${P.border}`, background: P.surface,
                      color: P.muted, transition: "all 0.15s", textDecoration: "none",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = P.pine; e.currentTarget.style.color = P.pine; e.currentTarget.style.background = "#e8f0e4"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.muted; e.currentTarget.style.background = P.surface; }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div>
              {sent ? (
                <div style={{
                  padding: "32px", border: `1px solid ${P.pine}30`,
                  borderLeft: `3px solid ${P.pine}`, background: "#eaf3ec",
                }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: P.pine, marginBottom: "6px" }}>Message sent.</div>
                  <div style={{ fontSize: "12px", color: P.muted }}>Thanks — I'll get back to you soon.</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: P.dim, display: "block", marginBottom: "5px" }}>Name</label>
                      <input
                        type="text" required placeholder="Alex Smith"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = P.pine)}
                        onBlur={e => (e.target.style.borderColor = P.border)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: P.dim, display: "block", marginBottom: "5px" }}>Email</label>
                      <input
                        type="email" required placeholder="you@example.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = P.pine)}
                        onBlur={e => (e.target.style.borderColor = P.border)}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: P.dim, display: "block", marginBottom: "5px" }}>Subject</label>
                    <input
                      type="text" required placeholder="Re: FDE role"
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = P.pine)}
                      onBlur={e => (e.target.style.borderColor = P.border)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: P.dim, display: "block", marginBottom: "5px" }}>Message</label>
                    <textarea
                      required rows={5} placeholder="What are you building?"
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      style={{ ...inputStyle, resize: "vertical" }}
                      onFocus={e => (e.target.style.borderColor = P.pine)}
                      onBlur={e => (e.target.style.borderColor = P.border)}
                    />
                  </div>
                  {formError && (
                    <div style={{ fontSize: "11px", color: "#b85c3a" }}>{formError}</div>
                  )}
                  <button
                    type="submit" disabled={sending}
                    style={{
                      padding: "11px 24px", background: sending ? P.border : P.pine,
                      color: "#fff", border: "none", cursor: sending ? "not-allowed" : "none",
                      fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase",
                      fontFamily: "var(--font-mono)", transition: "background 0.15s",
                      alignSelf: "flex-start",
                    }}
                    onMouseEnter={e => { if (!sending) (e.currentTarget as HTMLButtonElement).style.background = "#1e3d29"; }}
                    onMouseLeave={e => { if (!sending) (e.currentTarget as HTMLButtonElement).style.background = P.pine; }}
                  >
                    {sending ? "Sending…" : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          borderTop: `1px solid ${P.border}`,
          padding: "16px 36px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          maxWidth: "1200px", margin: "0 auto",
        }}>
          <span style={{ fontSize: "9px", letterSpacing: "0.12em", color: P.dim, textTransform: "uppercase" }}>
            © 2025 Alex Hofmann
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#3a9e5c", boxShadow: "0 0 5px #3a9e5c", animation: "pulse 2.5s ease-in-out infinite" }} />
            <span style={{ fontSize: "9px", letterSpacing: "0.12em", color: P.dim, textTransform: "uppercase" }}>hoffswitch.com</span>
          </div>
        </footer>

        {/* ── PANEL ── */}
        <WorkshopPanel hotspot={active} onClose={() => setActive(null)} onNavigate={h => setActive(h)} />

      </div>{/* end site-content fade wrapper */}
    </div>
  );
}
