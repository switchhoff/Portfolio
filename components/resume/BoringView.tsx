"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm, ValidationError } from "@formspree/react";
import { type Project } from "@/lib/projects";
// Single source of truth — shared with Fun View SVG popup cards
import { PATH_DATA } from "@/lib/pathData";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/icons";

/**
 * BoringView Component
 * 
 * This is the "Resume" view of the portfolio. It presents professional information
 * in a clean, high-performance, and accessible layout.
 * 
 * Architecture:
 * - Content is synced with the "Fun" view via pathData.ts.
 * - Mobile-first design: Automatically stacks columns and hides non-essential sidebars on small screens.
 * - Smooth Reveal: Uses framer-motion for subtle entry animations as the user scrolls.
 * - Multi-mode: Supports high-contrast light and dark themes.
 */
interface BoringViewProps {
  projects: Project[];
  age: number;
  darkMode?: boolean;
}

// Visual-only metadata — all text sourced from pathData.ts
const WORK_VISUAL: Record<number, { color: string; color2: string; photo: string | null }> = {
  64: { color: "#ef4444", color2: "#f97316", photo: "/singapore2.jpg" }, // Fortifyedge  (path 64)
  88: { color: "#f97316", color2: "#f59e0b", photo: "/ta.jpg" }, // Monash TA    (path 88)
  68: { color: "#f59e0b", color2: "#eab308", photo: "/tonbo.jpg" }, // Tonbo        (path 68)
  66: { color: "#eab308", color2: "#facc15", photo: "/banshee.jpg" }, // DefendTex    (path 66)
};
const WORK_PATHS = [64, 88, 68, 66];

// Hackathon entries — paths 58, 60, 62, 96 in pathData.ts
const HACKATHON_VISUAL: Record<number, { color: string; color2: string; photo?: string; video?: string }> = {
  57: { color: "#f59e0b", color2: "#d97706", photo: "/powerpots.png" }, // Laing O'Rourke Prize — PowerPots
  58: { color: "#10b981", color2: "#059669", video: "/sandfilter.mp4" }, // Humanitarian Innovation — PowerPots
  96: { color: "#14b8a6", color2: "#0d9488", photo: "/CoolRoof.png" }, // Humanitarian Innovation — Fiji
  60: { color: "#6366f1", color2: "#8b5cf6", photo: "/rbc.avif" }, // Robot Building Competition
  62: { color: "#ec4899", color2: "#db2777", photo: "/alphabot.JPG" }, // Monash HardHack
};
const HACKATHON_PATHS = [57, 58, 96, 60, 62];

// Interests — path numbers matching Fun View SVG cards
const INTEREST_PATHS = [8, 100, 4, 24, 94, 98, 102, 82, 18, 28, 26, 10, 42];

const INTEREST_PAIRS = [
  [42, 82],  // Travel / Hiking
  [26, 10],  // Photography / Saxophone
  [4, 24],   // Art / Craft
  [94, 102], // Board Games / Running
  [100, 8],  // Soccer / Golf
  [28, 18],  // Movies / Books
  [98, 98],  // Video Games (Single, but using pair logic)
];

// Extract display labels from pathData items (skip action/audio items)
function getInterestItems(path: number): any[] {
  const d = PATH_DATA[path];
  if (!d) return [];
  if (path === 26) return [
    { label: "@alexhofmannn", href: "https://instagram.com/alexhofmannn" },
    { label: "@alexhofmannphotography", href: "https://instagram.com/alexhofmannphotography" }]; // Photography — link-only card
  if (path === 10) return ["Alto", "Baritone"]; // Saxophone — items are audio clips, show instruments

  const extractedItems: any[] = [];

  if (d.items) {
    extractedItems.push(...d.items.filter(i => {
      if (typeof i === "string") return true;
      return !("audio" in i) && (!("action" in i) || i.action === "show_overland");
    }));
  }

  if (d.content) {
    d.content.forEach(block => {
      if (block.type === 'text') {
        extractedItems.push(block.text);
      } else if (block.type === 'link') {
        extractedItems.push({ label: block.label || block.url, href: block.url });
      }
    });
  }

  return extractedItems;
}

const EDUCATION = [
  // Sourced from pathData path 70 (Monash University entries)
  { path: 70, degree: "Master of Electrical Engineering", school: "Monash University", period: "2024", description: "87 WAM - 4.00 GPA", achievements: ["Academic Medal Winner 2024"], color: "#ef4444", color2: "#f43f5e", photo: "/award2.jpg" },
  { path: 70, degree: "Bachelor of Robotics and Mechatronics Engineering", school: "Monash University", period: "2020 – 2023", description: "Specialization: Artificial Intelligence\nMinor: Software Engineering", achievements: ["Dean's Honour List 2020–2023"], color: "#f97316", color2: "#ef4444", photo: "/grad.jpg" },
];



// Manual projects not sourced from GitHub
const MANUAL_PROJECTS = [
  { id: "worldmap", repo: "", name: "World Map", tagline: "A custom, hand-cut and assembled world map out of wood", tags: ["WOODWORKING", "TRAVEL"], color: "#10b981", firebase: null },
];

const S = {
  font: "var(--font-inter), system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
  section: (isMobile: boolean) => ({ padding: isMobile ? "2rem 1rem" : "3rem clamp(1.5rem, 6vw, 6rem)" }),
  inner: { maxWidth: "1100px", margin: "0 auto", width: "100%" },
  innerWide: { maxWidth: "1280px", margin: "0 auto", width: "100%" },
  bar: (color1: string, color2: string) => ({
    height: "6px", width: "96px", borderRadius: "9999px",
    background: `linear-gradient(to right, ${color1}, ${color2})`,
    marginBottom: "4rem",
  }),
};

function CarouselIndicator({ count, activeIndex, color, dark }: { count: number, activeIndex: number, color: string, dark: boolean }) {
  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "0.75rem" }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === activeIndex ? "24px" : "8px",
            backgroundColor: i === activeIndex ? color : (dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"),
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ height: "4px", borderRadius: "2px" }}
        />
      ))}
    </div>
  );
}

function Heading({ title, c1, c2, center, dark }: { title: string; c1: string; c2: string; center?: boolean; dark?: boolean }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      style={{ marginBottom: isMobile ? "1rem" : "2rem", textAlign: center ? "center" : "left" }}>
      <h2 style={{ fontSize: isMobile ? "1.7rem" : "2.3rem", fontWeight: 300, color: dark ? "#f9fafb" : "#111827", marginBottom: "0.25rem", lineHeight: 1.15 }}>{title}</h2>
      <div style={{ ...S.bar(c1, c2), height: "4px", width: "60px", marginBottom: isMobile ? "0.75rem" : "1.5rem", ...(center ? { margin: isMobile ? "0 auto 1.5rem" : "0 auto 2.5rem" } : {}) }} />
    </motion.div>
  );
}

function InterestCard({ pathId, interest, items, dm, i, onShowOverland }: { pathId: number, interest: any, items: any[], dm: boolean, i: number, onShowOverland: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: dm ? "#1a1a1a" : "#fff",
        borderRadius: "1rem",
        padding: "1.5rem",
        border: "2px solid",
        borderColor: isHovered ? (dm ? "#ffffff" : "#111827") : (dm ? "#2a2a2a" : "#f3f4f6"),
        boxShadow: isHovered ? (dm ? "0 4px 16px rgba(255,255,255,0.1)" : "0 4px 16px rgba(0,0,0,0.08)") : "none",
        transition: "border-color 0.2s, box-shadow 0.2s"
      }}
    >
      <div style={{ fontSize: "0.95rem", fontWeight: 600, color: dm ? "#ff0000ff" : "#fb0000ff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "6px" }}>
        {interest.name}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {items.map((item, idx) => {
          const isString = typeof item === "string";
          const label = isString ? item : item.label;
          const href = !isString ? item.href : undefined;
          const action = !isString ? item.action : undefined;

          return (
            <div key={idx} style={{ fontSize: "0.8rem", color: dm ? "#d1d5db" : "#3a3d44ff", display: "flex", alignItems: "center" }}>
              {action === "show_overland" ? (
                <button
                  onClick={onShowOverland}
                  style={{
                    background: "none", border: "none", padding: 0, cursor: "pointer",
                    color: dm ? "#348efdff" : "#104db1ff", textDecoration: "none",
                    fontSize: "inherit", fontFamily: "inherit", fontWeight: "inherit"
                  }}
                >
                  {label}
                </button>
              ) : href ? (
                <a href={href} target="_blank" rel="noreferrer" style={{ color: dm ? "#348efdff" : "#104db1ff", textDecoration: "none" }}>
                  {label}
                </a>
              ) : (
                label
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function BoringView({ projects, age, darkMode }: BoringViewProps) {
  const dm = darkMode ?? false;
  const [formState, handleSubmit] = useForm("xzdynydr");
  const [activeHackathon, setActiveHackathon] = useState(0);
  const [activeExp, setActiveExp] = useState(0);
  const [activeEdu, setActiveEdu] = useState(0);
  const allProjects = [...projects, ...MANUAL_PROJECTS];
  const [activeProject, setActiveProject] = useState(0);
  const [activeInterests, setActiveInterests] = useState(0);
  const [showOverland, setShowOverland] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState("boring-about");

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.3, rootMargin: "-10% 0px -70% 0px" });

    navItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const navItems = [
    { id: "boring-about", label: "About", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg> },
    { id: "boring-experience", label: "Experience", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg> },
    { id: "boring-hackathons", label: "Hackathons", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M12 2a7 7 0 0 1 7 7c0 2.6-1.4 4.9-3.5 6.2V17a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-1.8A7 7 0 0 1 5 9a7 7 0 0 1 7-7z" /></svg> },
    { id: "boring-education", label: "Education", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" /></svg> },
    { id: "boring-projects", label: "Projects", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3-3a1 1 0 0 0-1.4-1.4l-3 3" /><path d="M13 8L8 3 4 7l5 5" /><path d="m2 22 5.5-1.5L19 9l-4-4L3.5 16.5z" /></svg> },
    { id: "boring-interests", label: "Interests", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" /></svg> },
    { id: "boring-contact", label: "Contact", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg> },
  ];

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: dm ? "#0f0f0f" : "#fff", color: dm ? "#f9fafb" : "#111827", fontFamily: S.font, fontSize: "13px", position: "relative" }}>

      {/* ── SIDEBAR TOC ── */}
      {!isMobile && (
        <nav style={{
          position: "fixed",
          left: "1.25rem",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 80,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}>
          {/* Pulsing indicator dot */}
          {activeSection && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              style={{
                position: "absolute",
                left: "-12px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#ef4444",
                boxShadow: "0 0 10px #ef4444",
                top: navItems.findIndex(n => n.id === activeSection) * 48 + 16, 
                transition: "top 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                zIndex: 81,
              }}
            />
          )}
          {navItems.map(({ id, label, icon }) => (
            <button
              key={id}
              title={label}
              onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
              onMouseEnter={e => {
                e.currentTarget.style.background = dm ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,1)";
                e.currentTarget.style.color = dm ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.9)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = dm ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.85)";
                e.currentTarget.style.color = (id === activeSection) ? "#ef4444" : (dm ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)");
              }}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                border: `1px solid ${id === activeSection ? "#ef444444" : (dm ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)")}`,
                background: dm ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.85)",
                color: id === activeSection ? "#ef4444" : (dm ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)"),
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              {icon}
            </button>
          ))}
        </nav>
      )}

      {/* ── ABOUT / HERO ── */}
      <section id="boring-about" style={{ ...S.section(isMobile), paddingTop: isMobile ? "2.5rem" : "4rem", background: dm ? "#0a0a0a" : "#fafafa", borderBottom: `1px solid ${dm ? "#1a1a1a" : "#f3f4f6"}` }}>
        <div style={S.inner}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: isMobile ? "3rem" : "5rem", alignItems: "start" }}>
            {/* Photo */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", width: "220px", height: "220px" }}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(135deg, #ef4444, #f97316)",
                  borderRadius: "1.5rem", transform: "rotate(3deg)", opacity: 0.15, filter: "blur(20px)",
                }} />
                <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "1.5rem", overflow: "hidden", border: `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}`, boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/alex.jpeg" alt="Alex Hofmann" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </div>
            </motion.div>

            {/* Bio */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div style={{ display: "inline-block", padding: "0.4rem 1rem", background: dm ? "rgba(239,68,68,0.15)" : "#fef2f2", color: "#dc2626", borderRadius: "9999px", fontSize: "0.85rem", marginBottom: "1.5rem", border: `1px solid ${dm ? "rgba(239,68,68,0.3)" : "#fee2e2"}` }}>
                Melbourne, VIC
              </div>
              <h1 style={{ fontSize: "2.8rem", fontWeight: 300, color: dm ? "#f9fafb" : "#111827", marginBottom: "0.5rem", lineHeight: 1.1, display: "flex", alignItems: "baseline", gap: "12px" }}>
                Alex Hofmann
              </h1>
              <p style={{ fontSize: "1.25rem", color: dm ? "#9ca3af" : "#6b7280", marginBottom: "1.5rem" }}>Engineer</p>
              <p style={{ fontSize: "0.9rem", color: dm ? "#d1d5db" : "#374151", lineHeight: 1.8, marginBottom: "1rem" }}>
                Building, making, creating <span style={{ color: "#dc2626", fontWeight: 500 }}>cool things</span>.
              </p>
              <p style={{ fontSize: "0.95rem", color: dm ? "#9ca3af" : "#6b7280", lineHeight: 1.8, marginBottom: "1rem" }}>
                I build AI and I build with AI — whatever the tool needed, I learn it quickly and build fast across all aspects of complex mechatronics project lifecycles
              </p>
              <p style={{ fontSize: "1rem", color: dm ? "#9ca3af" : "#6b7280", lineHeight: 1.8, marginBottom: "1rem" }}>
                I've taught final-year students AI fundamentals in the morning and watched my unmanned vehicle drive autonomously in the afternoon.
              </p>
              <p style={{ fontSize: "1rem", color: dm ? "#9ca3af" : "#6b7280", lineHeight: 1.8, marginBottom: "2rem" }}>
                R&D Engineer → Systems Engineer → Full Stack Developer → FDE → Team Lead → ???
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ── */}
      <section id="boring-experience" style={{ ...S.section(isMobile), background: dm ? "#0f0f0f" : "#fff" }}>
        <div style={S.inner}>
          <Heading title="Experience" c1="#ef4444" c2="#f97316" dark={dm} />

          {/* ── Experience Content ── */}
          {isMobile ? (
            <div style={{ position: "relative", marginBottom: "0.5rem" }}>
              <div style={{ position: "relative", height: "420px", display: "flex", alignItems: "center", justifyContent: "center", perspective: "1000px", width: "100%", overflow: "hidden" }}>
                <div style={{ position: "relative", width: "100%", maxWidth: "320px", height: "100%" }}>
                  {WORK_PATHS.map((pathId, i) => {
                    const w = PATH_DATA[pathId];
                    const v = WORK_VISUAL[pathId];
                    if (!w || !v) return null;

                    let offset = i - activeExp;
                    if (offset > WORK_PATHS.length / 2) offset -= WORK_PATHS.length;
                    if (offset < -WORK_PATHS.length / 2) offset += WORK_PATHS.length;

                    const isActive = offset === 0;
                    const isVisible = Math.abs(offset) <= 1;

                    return (
                      <motion.div
                        key={pathId}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(_, info) => {
                          const threshold = 50;
                          if (info.offset.x > threshold) setActiveExp((prev) => (prev - 1 + WORK_PATHS.length) % WORK_PATHS.length);
                          else if (info.offset.x < -threshold) setActiveExp((prev) => (prev + 1) % WORK_PATHS.length);
                        }}
                        animate={{
                          x: `calc(-50% + ${offset * 115}%)`,
                          y: "-50%",
                          scale: isActive ? 1 : 0.85,
                          opacity: isActive ? 1 : (isVisible ? 0.35 : 0),
                          zIndex: isActive ? 10 : 5 - Math.abs(offset),
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{
                          position: "absolute", top: "50%", left: "50%", width: "100%",
                          background: dm ? "#1a1a1a" : "#fff", borderRadius: "1.5rem",
                          overflow: "hidden", border: `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}`,
                          boxShadow: isActive ? "0 12px 32px rgba(0,0,0,0.15)" : "0 4px 16px rgba(0,0,0,0.06)",
                          pointerEvents: isActive ? "auto" : "none",
                          cursor: "grab"
                        }}
                        whileTap={{ cursor: "grabbing" }}
                      >
                        <div style={{ height: "120px", background: `linear-gradient(135deg, ${v.color}22, ${v.color2}11)`, position: "relative", borderBottom: `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}`, overflow: "hidden" }}>
                          {v.photo ? (
                            <img src={v.photo} alt={w.company} style={{ 
                              position: "absolute", 
                              inset: 0, 
                              width: "100%", 
                              height: "100%", 
                              objectFit: "cover", 
                              objectPosition: pathId === 88 ? "center" : (isMobile && pathId === 66) ? "30% bottom" : (isMobile && pathId === 64) ? "30% 40%" : "30% center",
                              transform: pathId === 88 ? "scale(1.2)" : "none" 
                            }} />
                          ) : (
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: `linear-gradient(135deg, ${v.color}44, ${v.color2}44)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={v.color} strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{ padding: "1.25rem" }}>
                          <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: dm ? "#f9fafb" : "#111827", marginBottom: "0.4rem" }}>
                            {w.role ?? w.name}
                          </h4>
                          <p style={{ fontSize: "0.9rem", fontWeight: 500, color: v.color, marginBottom: "0.2rem" }}>{w.company}</p>
                          <p style={{ fontSize: "0.8rem", color: dm ? "#9ca3af" : "#6b7280", marginBottom: "0.75rem" }}>{w.date}</p>
                          <p style={{ fontSize: isMobile ? "0.8rem" : "0.85rem", color: dm ? "#d1d5db" : "#4b5563", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "0.75rem" }}>
                            {w.description}
                          </p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                            {w.tags?.map(t => (
                              <span key={t} style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem", background: dm ? "#222" : "#f3f4f6", color: dm ? "#d1d5db" : "#374151", borderRadius: "9999px", border: `1px solid ${dm ? "#333" : "#e5e7eb"}`, whiteSpace: "nowrap" }}>{t}</span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              <CarouselIndicator count={WORK_PATHS.length} activeIndex={activeExp} color="#ef4444" dark={dm} />
            </div>
          ) : (
            <div style={{ position: "relative", marginBottom: "3rem" }}>
              <div style={{ position: "absolute", left: "28px", top: 0, bottom: 0, width: "2px", background: "linear-gradient(to bottom, #ef4444, #f97316, #f59e0b)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                {WORK_PATHS.map((pathId, i) => {
                  const w = PATH_DATA[pathId];
                  const v = WORK_VISUAL[pathId];
                  if (!w || !v) return null;
                  return (
                    <motion.div key={pathId} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      style={{ position: "relative", paddingLeft: isMobile ? "3.5rem" : "5rem" }}>
                      <div style={{ position: "absolute", left: isMobile ? "14px" : "20px", top: "2rem", width: "18px", height: "18px", borderRadius: "50%", background: `linear-gradient(135deg, ${v.color}, ${v.color2})`, border: `3px solid ${dm ? "#0f0f0f" : "#fff"}`, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />
                      <div style={{ background: dm ? "#1a1a1a" : "#fff", borderRadius: "1.5rem", overflow: "hidden", border: `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}`, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", display: "flex", flexDirection: isMobile ? "column" : "row" }}>
                        {/* Photo / placeholder */}
                        <div style={{ width: isMobile ? "100%" : "200px", height: isMobile ? "160px" : "auto", flexShrink: 0, position: "relative", borderRight: !isMobile ? `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}` : "none", borderBottom: isMobile ? `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}` : "none", background: `linear-gradient(135deg, ${v.color}22, ${v.color2}11)`, overflow: "hidden" }}>
                          {v.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={v.photo} alt={w.company} style={{ 
                              position: "absolute", 
                              inset: 0, 
                              width: "100%", 
                              height: "100%", 
                              objectFit: "cover", 
                              objectPosition: "center", 
                              display: "block",
                              transform: pathId === 88 ? "scale(1.1)" : "none"
                            }} />
                          ) : (
                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `linear-gradient(135deg, ${v.color}44, ${v.color2}44)`, border: `2px dashed ${v.color}66`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={v.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                </svg>
                              </div>
                              <span style={{ fontSize: "0.7rem", color: dm ? "#4b5563" : "#9ca3af" }}>Photo</span>
                            </div>
                          )}
                        </div>
                        {/* Content — text from pathData */}
                        <div style={{ padding: "1.75rem 2rem 2rem", flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "0.75rem" }}>
                            <div>
                              <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: dm ? "#f9fafb" : "#111827", marginBottom: "0.3rem", display: "flex", alignItems: "center", gap: "8px" }}>
                                {w.role ?? w.name}
                                <span style={{ fontSize: "10px", fontWeight: 700, color: v.color, background: `${v.color}18`, borderRadius: "4px", padding: "2px 6px", fontFamily: "monospace" }}>#{pathId}</span>
                              </h3>
                              <p style={{ fontSize: "1rem", fontWeight: 500, background: `linear-gradient(to right, ${v.color}, ${v.color2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{w.company}</p>
                            </div>
                            <span style={{ padding: "0.4rem 1rem", background: dm ? "#111" : "#f9fafb", color: dm ? "#9ca3af" : "#6b7280", borderRadius: "9999px", fontSize: "0.85rem", whiteSpace: "nowrap", border: `1px solid ${dm ? "#2a2a2a" : "#e5e7eb"}` }}>{w.date}</span>
                          </div>
                          <p style={{ fontSize: "0.9rem", color: dm ? "#9ca3af" : "#6b7280", lineHeight: 1.75, marginBottom: w.tags?.length ? "1.25rem" : 0 }}>{w.description}</p>
                          {w.tags && (
                            <div style={{
                              display: "flex",
                              flexWrap: isMobile ? "nowrap" : "wrap",
                              gap: "0.5rem",
                              overflowX: isMobile ? "auto" : "visible",
                              paddingBottom: isMobile ? "0.5rem" : 0,
                              WebkitOverflowScrolling: "touch"
                            }}>
                              {w.tags.map(t => (
                                <span key={t} style={{ padding: "0.25rem 0.6rem", background: dm ? "#111" : "#f9fafb", color: dm ? "#d1d5db" : "#374151", borderRadius: "0.5rem", fontSize: "0.8rem", border: `1px solid ${dm ? "#2a2a2a" : "#e5e7eb"}`, whiteSpace: "nowrap" }}>{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ── HACKATHONS ── */}
      <section id="boring-hackathons" style={{ ...S.section(isMobile), background: dm ? "linear-gradient(135deg, #0a0f0a 0%, #0a0a1a 100%)" : "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)" }}>
        <div style={S.inner}>
          <Heading title="Hackathons" c1="#10b981" c2="#6366f1" dark={dm} />
          <div style={{ position: "relative" }}>
            <div style={{ position: "relative", height: isMobile ? "420px" : "480px", display: "flex", alignItems: "center", justifyContent: "center", perspective: "1000px", width: "100%", overflow: "hidden" }}>

              {!isMobile && (
                <>
                  <button
                    onClick={() => setActiveHackathon((prev) => (prev - 1 + HACKATHON_PATHS.length) % HACKATHON_PATHS.length)}
                    style={{ position: "absolute", left: "1rem", zIndex: 50, background: dm ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", color: dm ? "#fff" : "#000", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <button
                    onClick={() => setActiveHackathon((prev) => (prev + 1) % HACKATHON_PATHS.length)}
                    style={{ position: "absolute", right: "1rem", zIndex: 50, background: dm ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", color: dm ? "#fff" : "#000", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              <div style={{ position: "relative", width: "100%", maxWidth: "340px", height: "100%" }}>
                {HACKATHON_PATHS.map((pathId, i) => {
                  const h = PATH_DATA[pathId];
                  const v = HACKATHON_VISUAL[pathId];
                  if (!h || !v) return null;

                  let offset = i - activeHackathon;
                  if (offset > HACKATHON_PATHS.length / 2) offset -= HACKATHON_PATHS.length;
                  if (offset < -HACKATHON_PATHS.length / 2) offset += HACKATHON_PATHS.length;

                  const isActive = offset === 0;
                  const isVisible = Math.abs(offset) <= 1;

                  return (
                    <motion.div
                      key={pathId}
                      drag={isMobile ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => {
                        const threshold = 50;
                        if (info.offset.x > threshold) setActiveHackathon((prev) => (prev - 1 + HACKATHON_PATHS.length) % HACKATHON_PATHS.length);
                        else if (info.offset.x < -threshold) setActiveHackathon((prev) => (prev + 1) % HACKATHON_PATHS.length);
                      }}
                      animate={{
                        x: `calc(-50% + ${offset * 120}%)`,
                        y: "-50%",
                        scale: isActive ? 1 : 0.85,
                        opacity: isActive ? 1 : (isVisible ? 0.35 : 0),
                        zIndex: isActive ? 10 : 5 - Math.abs(offset),
                        rotateY: offset * -15
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{
                        position: "absolute", top: "50%", left: "50%", width: "100%",
                        background: dm ? "#1a1a1a" : "#fff", borderRadius: "1.25rem",
                        overflow: "hidden", border: `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}`,
                        boxShadow: isActive ? "0 12px 32px rgba(0,0,0,0.15)" : "0 4px 16px rgba(0,0,0,0.06)",
                        pointerEvents: isActive ? "auto" : "none",
                        cursor: isMobile ? "grab" : "default"
                      }}
                    >
                      <div style={{ height: "160px", background: `linear-gradient(135deg, ${v.color}22, ${v.color2}11)`, position: "relative", borderBottom: `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}` }}>
                        {v.video ? (
                          <video
                            src={v.video}
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : v.photo ? (
                          <img src={v.photo} alt={h.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pathId === 57 ? "center 70%" : "center" }} />
                        ) : (
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={v.color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div style={{ height: "4px", background: `linear-gradient(to right, ${v.color}, ${v.color2})` }} />
                      <div style={{ padding: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.6rem" }}>
                          <h4 style={{ fontSize: "1rem", fontWeight: 700, color: dm ? "#f9fafb" : "#111827", lineHeight: 1.3, display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            {h.role ?? h.name}
                            <span style={{ fontSize: "10px", fontWeight: 700, color: v.color, background: `${v.color}18`, borderRadius: "4px", padding: "1px 5px", fontFamily: "monospace", flexShrink: 0 }}>#{pathId}</span>
                          </h4>
                          <span style={{ padding: "0.25rem 0.7rem", background: `${v.color}20`, color: v.color, borderRadius: "9999px", fontSize: "0.78rem", whiteSpace: "nowrap", fontWeight: 600, flexShrink: 0 }}>{h.date}</span>
                        </div>
                        <p style={{ fontSize: "0.85rem", fontWeight: 500, color: dm ? "#9ca3af" : "#6b7280", marginBottom: "0.75rem" }}>{h.company}</p>
                        <p style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", color: dm ? "#9ca3af" : "#4b5563", lineHeight: 1.5, marginBottom: "1rem" }}>{h.description}</p>
                        {h.items && h.items.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                            {h.items.map((item, ii) => typeof item === "string" ? null : (
                              <span key={ii} style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", background: dm ? "#222" : "#f3f4f6", color: dm ? "#d1d5db" : "#374151", borderRadius: "9999px", border: `1px solid ${dm ? "#333" : "#e5e7eb"}`, whiteSpace: "nowrap" }}>
                                {item.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            {isMobile && <CarouselIndicator count={HACKATHON_PATHS.length} activeIndex={activeHackathon} color="#10b981" dark={dm} />}
          </div>
        </div>
      </section>

      {/* ── EDUCATION ── */}
      <section id="boring-education" style={{ ...S.section(isMobile), background: dm ? "linear-gradient(135deg, #111 0%, #1a0a0a 100%)" : "linear-gradient(135deg, #fafafa 0%, #fff5f5 100%)" }}>
        <div style={S.inner}>
          <Heading title="Education" c1="#f97316" c2="#ef4444" dark={dm} />
          {/* ── Education Content ── */}
          {isMobile ? (
            <div style={{ position: "relative", marginBottom: "0.5rem" }}>
              <div style={{ position: "relative", height: "460px", display: "flex", alignItems: "center", justifyContent: "center", perspective: "1000px", width: "100%", overflow: "hidden" }}>
                <div style={{ position: "relative", width: "100%", maxWidth: "320px", height: "100%" }}>
                  {EDUCATION.map((edu, i) => {
                    let offset = i - activeEdu;
                    if (offset > EDUCATION.length / 2) offset -= EDUCATION.length;
                    if (offset < -EDUCATION.length / 2) offset += EDUCATION.length;

                    const isActive = offset === 0;
                    const isVisible = Math.abs(offset) <= 1;

                    return (
                      <motion.div
                        key={i}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(_, info) => {
                          const threshold = 50;
                          if (info.offset.x > threshold) setActiveEdu((prev) => (prev - 1 + EDUCATION.length) % EDUCATION.length);
                          else if (info.offset.x < -threshold) setActiveEdu((prev) => (prev + 1) % EDUCATION.length);
                        }}
                        animate={{
                          x: `calc(-50% + ${offset * 115}%)`,
                          y: "-50%",
                          scale: isActive ? 1 : 0.85,
                          opacity: isActive ? 1 : (isVisible ? 0.35 : 0),
                          zIndex: isActive ? 10 : 5 - Math.abs(offset),
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{
                          position: "absolute", top: "50%", left: "50%", width: "100%",
                          background: dm ? "#1a1a1a" : "#fff", borderRadius: "1.5rem",
                          overflow: "hidden", border: `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}`,
                          boxShadow: isActive ? "0 12px 32px rgba(0,0,0,0.15)" : "0 4px 16px rgba(0,0,0,0.06)",
                          pointerEvents: isActive ? "auto" : "none",
                          cursor: "grab"
                        }}
                      >
                        <div style={{ height: "6px", background: `linear-gradient(to right, ${edu.color}, ${edu.color2})` }} />
                        {edu.photo && (
                          <div style={{ width: "100%", aspectRatio: "16/9", position: "relative", overflow: "hidden" }}>
                            <img src={edu.photo} alt={edu.degree} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: edu.photo === "/award2.jpg" ? "center 40%" : "center" }} />
                          </div>
                        )}
                        <div style={{ padding: "1.5rem" }}>
                            <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: dm ? "#f9fafb" : "#111827", marginBottom: "0.4rem" }}>
                              {edu.degree}
                            </h4>
                            <p style={{ fontSize: "0.9rem", fontWeight: 500, color: edu.color, marginBottom: "0.5rem" }}>{edu.school}</p>
                            <p style={{ fontSize: "0.8rem", color: dm ? "#9ca3af" : "#6b7280", marginBottom: "0.75rem" }}>{edu.period}</p>
                            <p style={{ fontSize: "0.85rem", color: dm ? "#d1d5db" : "#4b5563", lineHeight: 1.5 }}>
                              {edu.description}
                            </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              <CarouselIndicator count={EDUCATION.length} activeIndex={activeEdu} color="#f97316" dark={dm} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {EDUCATION.map((edu, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  style={{ background: dm ? "#1a1a1a" : "#fff", borderRadius: "1.5rem", overflow: "hidden", border: `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}`, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
                  <div style={{ height: "6px", background: `linear-gradient(to right, ${edu.color}, ${edu.color2})` }} />
                  <div style={{ display: "flex", flexDirection: "row" }}>
                    {edu.photo && (
                      <div style={{ width: "200px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                        <img src={edu.photo} alt={edu.degree} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
                      </div>
                    )}
                    <div style={{ padding: isMobile ? "1.5rem" : "2.5rem", flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "0.75rem" }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: "1.3rem", fontWeight: 600, color: dm ? "#f9fafb" : "#111827", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "8px" }}>
                            {edu.degree}
                            <span style={{ fontSize: "10px", fontWeight: 700, color: edu.color, background: `${edu.color}18`, borderRadius: "4px", padding: "2px 6px", fontFamily: "monospace", flexShrink: 0 }}>#{edu.path}</span>
                          </h3>
                          <p style={{ fontSize: "1.05rem", fontWeight: 500, background: `linear-gradient(to right, ${edu.color}, ${edu.color2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{edu.school}</p>
                        </div>
                        <span style={{ padding: "0.4rem 1.2rem", background: dm ? "#111" : "#f9fafb", color: dm ? "#9ca3af" : "#6b7280", borderRadius: "9999px", fontSize: "0.85rem", whiteSpace: "nowrap", border: `1px solid ${dm ? "#2a2a2a" : "#e5e7eb"}` }}>{edu.period}</span>
                      </div>
                      <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: "1.5rem", whiteSpace: "pre-wrap" }}>{edu.description}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                        {edu.achievements.map((a, ai) => (
                          <div key={ai} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.1rem", background: dm ? "#111" : "#f9fafb", borderRadius: "0.75rem", border: `1px solid ${dm ? "#2a2a2a" : "#e5e7eb"}` }}>
                            <svg style={{ width: "18px", height: "18px", color: "#ef4444", flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span style={{ fontSize: "0.95rem", color: dm ? "#d1d5db" : "#374151" }}>{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="boring-projects" style={{ ...S.section(isMobile), background: dm ? "linear-gradient(135deg, #111 0%, #0a0a1a 100%)" : "linear-gradient(135deg, #fafafa 0%, #f0f9ff 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 30%, rgba(99,102,241,0.05), transparent 50%), radial-gradient(circle at 30% 70%, rgba(59,130,246,0.05), transparent 50%)", pointerEvents: "none" }} />
        <div style={S.inner}>
          <Heading title="Projects" c1="#6366f1" c2="#ec4899" dark={dm} />
        </div>

        {isMobile ? (
          <div style={{ position: "relative", marginBottom: "2rem" }}>
            <div style={{ position: "relative", height: "420px", display: "flex", alignItems: "center", justifyContent: "center", perspective: "1000px", width: "100%", overflow: "hidden" }}>
              <div style={{ position: "relative", width: "100%", maxWidth: "300px", height: "100%" }}>
                {allProjects.map((proj, i) => {
                  let offset = i - activeProject;
                  if (offset > allProjects.length / 2) offset -= allProjects.length;
                  if (offset < -allProjects.length / 2) offset += allProjects.length;

                  const isActive = offset === 0;
                  const isVisible = Math.abs(offset) <= 1;

                  return (
                    <motion.div
                      key={proj.id}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => {
                        const threshold = 50;
                        if (info.offset.x > threshold) setActiveProject((prev) => (prev - 1 + allProjects.length) % allProjects.length);
                        else if (info.offset.x < -threshold) setActiveProject((prev) => (prev + 1) % allProjects.length);
                      }}
                      animate={{
                        x: `calc(-50% + ${offset * 115}%)`,
                        y: "-50%",
                        scale: isActive ? 1 : 0.85,
                        opacity: isActive ? 1 : (isVisible ? 0.35 : 0),
                        zIndex: isActive ? 10 : 5 - Math.abs(offset),
                        rotateY: offset * -10
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{
                        position: "absolute", top: "50%", left: "50%", width: "100%",
                        background: dm ? "#1a1a1a" : "#fff", borderRadius: "1.5rem",
                        overflow: "hidden", border: `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}`,
                        boxShadow: isActive ? "0 12px 32px rgba(0,0,0,0.15)" : "0 4px 16px rgba(0,0,0,0.06)",
                        pointerEvents: isActive ? "auto" : "none",
                        cursor: "grab"
                      }}
                    >
                      <div style={{ height: "140px", background: `linear-gradient(135deg, ${proj.color}cc, ${proj.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem", position: "relative" }}>
                        <span style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))" }}>
                          {proj.id === "portfolio" ? "🖥️" : proj.id === "pawsbutton" ? "🐾" : proj.id === "benfl" ? "🏈" : proj.id === "minimise" ? "📱" : proj.id === "habitat" ? "🌱" : proj.id === "cavedisto" ? "📡" : proj.id === "lastyear" ? "📅" : proj.id === "sixclicks" ? "🔗" : proj.id === "bintherestore" ? "📦" : proj.id === "threadquarters" ? "🧵" : proj.id === "keysborough" ? "⚽" : proj.id === "worldmap" ? "🌍" : "💡"}
                        </span>
                      </div>
                      <div style={{ padding: "1.25rem" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: dm ? "#f9fafb" : "#111827", marginBottom: "0.4rem" }}>{proj.name}</h3>
                        <p style={{ fontSize: "0.85rem", color: dm ? "#9ca3af" : "#6b7280", lineHeight: 1.5, marginBottom: "1rem" }}>{proj.tagline}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                          {proj.tags.slice(0, 3).map(t => (
                            <span key={t} style={{ padding: "0.2rem 0.6rem", background: dm ? "#111" : "#f9fafb", color: dm ? "#d1d5db" : "#4b5563", borderRadius: "0.4rem", fontSize: "0.75rem", border: `1px solid ${dm ? "#2a2a2a" : "#e5e7eb"}`, whiteSpace: "nowrap" }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            <CarouselIndicator count={allProjects.length} activeIndex={activeProject} color="#6366f1" dark={dm} />
          </div>
        ) : (
          <div style={{ ...S.innerWide, position: "relative" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.25rem"
            }}>
              {allProjects.map((proj, i) => (
                <motion.div key={proj.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  style={{
                    background: dm ? "#1a1a1a" : "#fff",
                    borderRadius: "1.5rem",
                    overflow: "hidden",
                    border: `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}`,
                    transition: "transform 0.25s, box-shadow 0.25s",
                    cursor: "default"
                  }}
                  whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}>
                  <div style={{ height: "140px", background: `linear-gradient(135deg, ${proj.color}cc, ${proj.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", position: "relative" }}>
                    <span style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))" }}>
                      {proj.id === "portfolio" ? "🖥️" : proj.id === "pawsbutton" ? "🐾" : proj.id === "benfl" ? "🏈" : proj.id === "minimise" ? "📱" : proj.id === "habitat" ? "🌱" : proj.id === "cavedisto" ? "📡" : proj.id === "lastyear" ? "📅" : proj.id === "sixclicks" ? "🔗" : proj.id === "bintherestore" ? "📦" : proj.id === "threadquarters" ? "🧵" : proj.id === "keysborough" ? "⚽" : "💡"}
                    </span>
                  </div>
                  <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: dm ? "#f9fafb" : "#111827", marginBottom: "0.5rem" }}>{proj.name}</h3>
                    <p style={{ fontSize: "0.9rem", color: dm ? "#9ca3af" : "#6b7280", lineHeight: 1.6, marginBottom: "1rem", minHeight: "2.8rem" }}>{proj.tagline}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {proj.tags.map(t => (
                        <span key={t} style={{ padding: "0.25rem 0.65rem", background: dm ? "#111" : "#f9fafb", color: dm ? "#d1d5db" : "#4b5563", borderRadius: "0.4rem", fontSize: "0.8rem", border: `1px solid ${dm ? "#2a2a2a" : "#e5e7eb"}` }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── INTERESTS ── */}
      <section id="boring-interests" style={{ ...S.section(isMobile), padding: isMobile ? "1rem 1rem 1.5rem" : S.section(isMobile).padding, background: dm ? "#0f0f0f" : "#fff" }}>
        <div style={S.inner}>
          <Heading title="Interests" c1="#ef4444" c2="#ec4899" dark={dm} />
          
          {isMobile ? (
            <div style={{ position: "relative", marginBottom: "1rem" }}>
              <div style={{ position: "relative", height: "520px", display: "flex", alignItems: "center", justifyContent: "center", perspective: "1000px", width: "100%", overflow: "hidden" }}>
                <div style={{ position: "relative", width: "100%", maxWidth: "300px", height: "100%" }}>
                  {INTEREST_PAIRS.map((pair, i) => {
                    let offset = i - activeInterests;
                    if (offset > INTEREST_PAIRS.length / 2) offset -= INTEREST_PAIRS.length;
                    if (offset < -INTEREST_PAIRS.length / 2) offset += INTEREST_PAIRS.length;

                    const isActive = offset === 0;
                    const isVisible = Math.abs(offset) <= 1;

                    return (
                      <motion.div
                        key={i}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(_, info) => {
                          const threshold = 50;
                          if (info.offset.x > threshold) setActiveInterests((prev) => (prev - 1 + INTEREST_PAIRS.length) % INTEREST_PAIRS.length);
                          else if (info.offset.x < -threshold) setActiveInterests((prev) => (prev + 1) % INTEREST_PAIRS.length);
                        }}
                        animate={{
                          x: `calc(-50% + ${offset * 115}%)`,
                          y: "-50%",
                          scale: isActive ? 1 : 0.85,
                          opacity: isActive ? 1 : (isVisible ? 0.35 : 0),
                          zIndex: isActive ? 10 : 5 - Math.abs(offset),
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{
                          position: "absolute", top: "50%", left: "50%", width: "100%",
                          display: "flex", flexDirection: "column", gap: "1rem",
                          pointerEvents: isActive ? "auto" : "none",
                          cursor: "grab"
                        }}
                      >
                        {pair.map((pathId, idx) => {
                          const interest = PATH_DATA[pathId];
                          if (!interest) return null;
                          const items = getInterestItems(pathId);
                          const isSecond = idx === 1 && pair[0] !== pair[1];
                          
                          return (
                            <React.Fragment key={`${pathId}-${idx}`}>
                              {isSecond && (
                                <div style={{ 
                                  height: "20px", 
                                  display: "flex", 
                                  alignItems: "center", 
                                  justifyContent: "center",
                                  position: "relative",
                                  margin: "-0.5rem 0"
                                }}>
                                  <div style={{ width: "2px", height: "100%", background: `linear-gradient(to bottom, transparent, ${dm ? "#ffffff33" : "#00000011"}, transparent)` }} />
                                  <div style={{ 
                                    position: "absolute", 
                                    width: "6px", height: "6px", 
                                    borderRadius: "50%", 
                                    border: `1.5px solid ${dm ? "#ffffff33" : "#00000011"}`,
                                    background: dm ? "#0f0f0f" : "#fff"
                                  }} />
                                </div>
                              )}
                              <InterestCard pathId={pathId} interest={interest} items={items} dm={dm} i={i} onShowOverland={() => setShowOverland(true)} />
                            </React.Fragment>
                          );
                        })}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              <CarouselIndicator count={INTEREST_PAIRS.length} activeIndex={activeInterests} color="#ef4444" dark={dm} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
              {INTEREST_PATHS.map((pathId, i) => {
                const interest = PATH_DATA[pathId];
                if (!interest) return null;
                const items = getInterestItems(pathId);
                return <InterestCard key={pathId} pathId={pathId} interest={interest} items={items} dm={dm} i={i} onShowOverland={() => setShowOverland(true)} />;
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="boring-contact" style={{ ...S.section(isMobile), position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #111827 0%, #1e1b4b 50%, #312e81 100%)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(239,68,68,0.08), transparent 60%)", pointerEvents: "none" }} />
        <div style={{ ...S.inner, position: "relative" }}>
          <Heading title="Let's Connect" c1="#ef4444" c2="#f97316" center dark />

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 3fr", gap: "2rem", alignItems: "start" }}>
            {/* Links panel */}
            <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", borderRadius: "1.5rem", padding: "2rem", border: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 style={{ fontSize: "1.3rem", color: "#fff", fontWeight: 300, marginBottom: "2rem" }}>Find me at</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {[
                  { href: "mailto:alexanderhofmann@outlook.com.au", icon: <Mail size={22} />, label: "Email", value: "alexanderhofmann@outlook.com.au", bg: "rgba(43, 232, 59, 0.15)", color: "#42ce2aff" },
                  { href: "https://github.com/switchhoff", icon: <GithubIcon size={22} />, label: "GitHub", value: "switchhoff", bg: "rgba(255,255,255,0.08)", color: "#d1d5db" },
                  { href: "https://linkedin.com/in/hofmannalexb/", icon: <LinkedinIcon size={22} />, label: "LinkedIn", value: "hofmannalexb", bg: "rgba(59,130,246,0.15)", color: "#93c5fd" },
                  { href: "https://instagram.com/alexhofmannn", icon: <InstagramIcon size={22} />, label: "Instagram", value: "@alexhofmannn", bg: "rgba(233, 89, 57, 0.15)", color: "#ee7a06ff" },
                ].map(item => (
                  <a key={item.label} href={item.href} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "1rem", textDecoration: "none" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "0.875rem", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.7rem", color: item.color, marginBottom: "1px" }}>{item.label}</div>
                      <div style={{ fontSize: "0.85rem", color: "#fff" }}>{item.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Form */}
            <div style={{ background: dm ? "#1a1a1a" : "#fff", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 25px 50px rgba(0,0,0,0.25)", border: dm ? "1px solid #2a2a2a" : "none" }}>
              {formState.succeeded ? (
                <div style={{ textAlign: "center", padding: "3rem 0" }}>
                  <Send style={{ margin: "0 auto 1rem", color: "#ef4444", width: 32, height: 32 }} />
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 600, color: dm ? "#f9fafb" : "#111827", marginBottom: "0.5rem" }}>Message sent!</h3>
                  <p style={{ fontSize: "0.95rem", color: "#9ca3af" }}>I'll get back to you shortly.</p>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 500, color: dm ? "#f9fafb" : "#111827", marginBottom: "1.75rem" }}>Send a Message</h3>
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Name</label>
                        <input type="text" name="name" required placeholder="..."
                          style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "0.75rem", border: `2px solid ${dm ? "#2a2a2a" : "#e5e7eb"}`, background: dm ? "#111" : "#f9fafb", color: dm ? "#f9fafb" : "#111827", fontSize: "1rem", outline: "none", transition: "border-color 0.2s" }}
                          onFocus={e => (e.target.style.borderColor = "#f87171")}
                          onBlur={e => (e.target.style.borderColor = dm ? "#2a2a2a" : "#e5e7eb")} />
                        <ValidationError field="name" errors={formState.errors} style={{ color: "#ef4444", fontSize: "0.8rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Email</label>
                        <input type="email" name="email" required placeholder="..."
                          style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "0.75rem", border: `2px solid ${dm ? "#2a2a2a" : "#e5e7eb"}`, background: dm ? "#111" : "#f9fafb", color: dm ? "#f9fafb" : "#111827", fontSize: "1rem", outline: "none", transition: "border-color 0.2s" }}
                          onFocus={e => (e.target.style.borderColor = "#f87171")}
                          onBlur={e => (e.target.style.borderColor = dm ? "#2a2a2a" : "#e5e7eb")} />
                        <ValidationError field="email" errors={formState.errors} style={{ color: "#ef4444", fontSize: "0.8rem" }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Subject</label>
                      <input type="text" name="subject" required placeholder="..."
                        style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "0.75rem", border: `2px solid ${dm ? "#2a2a2a" : "#e5e7eb"}`, background: dm ? "#111" : "#f9fafb", color: dm ? "#f9fafb" : "#111827", fontSize: "1rem", outline: "none" }}
                        onFocus={e => (e.target.style.borderColor = "#f87171")}
                        onBlur={e => (e.target.style.borderColor = dm ? "#2a2a2a" : "#e5e7eb")} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Message</label>
                      <textarea rows={5} name="message" required placeholder="..."
                        style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "0.75rem", border: `2px solid ${dm ? "#2a2a2a" : "#e5e7eb"}`, background: dm ? "#111" : "#f9fafb", color: dm ? "#f9fafb" : "#111827", fontSize: "1rem", outline: "none", resize: "none" }}
                        onFocus={e => (e.target.style.borderColor = "#f87171")}
                        onBlur={e => (e.target.style.borderColor = dm ? "#2a2a2a" : "#e5e7eb")} />
                      <ValidationError field="message" errors={formState.errors} style={{ color: "#ef4444", fontSize: "0.8rem" }} />
                    </div>
                    <ValidationError errors={formState.errors} style={{ color: "#ef4444", fontSize: "0.9rem" }} />
                    <button type="submit" disabled={formState.submitting}
                      style={{ width: "100%", padding: "1rem", borderRadius: "0.75rem", background: "linear-gradient(135deg, #ef4444, #f97316)", color: "#fff", fontSize: "1rem", fontWeight: 600, border: "none", boxShadow: "0 4px 16px rgba(239,68,68,0.3)", transition: "box-shadow 0.2s" }}>
                      {formState.submitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: dm ? "#000" : "#111827", color: "#6b7280", padding: "2rem", textAlign: "center", fontSize: "0.875rem" }}>
        © 2026 Alex Hofmann · offswitch
      </footer>

      {/* Overland Image Modal */}
      {showOverland && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.75)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px"
        }} onClick={() => setShowOverland(false)}>
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/overland.jpg" alt="Overland Track" style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: "8px", display: "block" }} />
            <button
              onClick={() => setShowOverland(false)}
              style={{
                position: "absolute", top: "-15px", right: "-15px",
                width: "30px", height: "30px", borderRadius: "50%",
                background: "#ef4444", color: "#fff", border: "2px solid #fff",
                fontSize: "16px", fontWeight: "bold", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
