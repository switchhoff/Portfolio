"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm, ValidationError } from "@formspree/react";
import { type Project } from "@/lib/projects";
// Single source of truth — shared with Fun View SVG popup cards
import { PATH_DATA } from "@/lib/pathData";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/icons";

interface BoringViewProps {
  projects: Project[];
  age: number;
  darkMode?: boolean;
}

// Visual-only metadata — all text sourced from pathData.ts
const WORK_VISUAL: Record<number, { color: string; color2: string; photo: string | null }> = {
  64: { color: "#ef4444", color2: "#f97316", photo: "/singapore2.jpg" }, // Fortifyedge  (path 64)
  88: { color: "#f97316", color2: "#f59e0b", photo: null }, // Monash TA    (path 88)
  68: { color: "#f59e0b", color2: "#eab308", photo: null }, // Tonbo        (path 68)
  66: { color: "#eab308", color2: "#facc15", photo: null }, // DefendTex    (path 66)
};
const WORK_PATHS = [64, 88, 68, 66];

// Hackathon entries — paths 58, 60, 62, 96 in pathData.ts
const HACKATHON_VISUAL: Record<number, { color: string; color2: string }> = {
  58: { color: "#10b981", color2: "#059669" }, // Humanitarian Innovation — PowerPots
  96: { color: "#14b8a6", color2: "#0d9488" }, // Humanitarian Innovation — Fiji
  60: { color: "#6366f1", color2: "#8b5cf6" }, // Robot Building Competition
  62: { color: "#ec4899", color2: "#db2777" }, // Monash HardHack
};
const HACKATHON_PATHS = [58, 96, 60, 62];

// Interests — path numbers matching Fun View SVG cards
const INTEREST_PATHS = [8, 26, 82, 18, 4, 24, 10, 28, 94, 98, 100, 102];

// Extract display labels from pathData items (skip action/audio items)
function getInterestItems(path: number): any[] {
  const d = PATH_DATA[path];
  if (!d) return [];
  if (path === 26) return [
    { label: "@alexhofmannn", href: "https://instagram.com/alexhofmannn" },
    { label: "@alexhofmannphotography", href: "https://instagram.com/alexhofmannphotography" }]; // Photography — link-only card
  if (path === 10) return ["Alto", "Baritone"]; // Saxophone — items are audio clips, show instruments
  if (!d.items) return [];
  return d.items.filter(i => {
    if (typeof i === "string") return true;
    return !("action" in i) && !("audio" in i);
  });
}

const EDUCATION = [
  // Sourced from pathData path 70 (Monash University entries)
  { path: 70, degree: "Master of Electrical Engineering", school: "Monash University", period: "2024", description: "87 WAM - 4.00 GPA", achievements: ["Academic Medal Winner 2024"], color: "#ef4444", color2: "#f43f5e" },
  { path: 70, degree: "Bachelor of Robotics and Mechatronics Engineering", school: "Monash University", period: "2020 – 2023", description: "Specialization: Artificial Intelligence\nMinor: Software Engineering", achievements: ["Dean's Honour List 2020–2023"], color: "#f97316", color2: "#ef4444" },
];



const S = {
  font: "var(--font-inter), system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
  section: { padding: "7rem clamp(1.5rem, 6vw, 6rem)" },
  inner: { maxWidth: "1100px", margin: "0 auto" },
  innerWide: { maxWidth: "1280px", margin: "0 auto" },
  bar: (color1: string, color2: string) => ({
    height: "6px", width: "96px", borderRadius: "9999px",
    background: `linear-gradient(to right, ${color1}, ${color2})`,
    marginBottom: "4rem",
  }),
};

function Heading({ title, c1, c2, center, dark }: { title: string; c1: string; c2: string; center?: boolean; dark?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      style={{ marginBottom: "4rem", textAlign: center ? "center" : "left" }}>
      <h2 style={{ fontSize: "3rem", fontWeight: 300, color: dark ? "#f9fafb" : "#111827", marginBottom: "1rem", lineHeight: 1.15 }}>{title}</h2>
      <div style={{ ...S.bar(c1, c2), ...(center ? { margin: "0 auto 4rem" } : {}) }} />
    </motion.div>
  );
}

function InterestCard({ pathId, interest, items, dm, i }: { pathId: number, interest: any, items: any[], dm: boolean, i: number }) {
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
      <div style={{ fontSize: "1rem", fontWeight: 600, color: dm ? "#ff0000ff" : "#fb0000ff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "6px" }}>
        {interest.name}
        <span style={{ fontSize: "9px", fontWeight: 700, color: "#ff0303ff", background: dm ? "#2a2a2a" : "#f3f4f6", borderRadius: "4px", padding: "1px 5px", fontFamily: "monospace" }}>#{pathId}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {items.map((item, idx) => {
          const isString = typeof item === "string";
          const label = isString ? item : item.label;
          const href = !isString ? item.href : undefined;

          return (
            <div key={idx} style={{ fontSize: "0.875rem", color: dm ? "#d1d5db" : "#3a3d44ff", display: "flex", alignItems: "center" }}>
              {href ? (
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

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: dm ? "#0f0f0f" : "#fff", color: dm ? "#f9fafb" : "#111827", fontFamily: S.font, fontSize: "16px" }}>

      {/* ── ABOUT ── */}
      <section style={{
        ...S.section,
        position: "relative",
        overflow: "hidden",
        background: dm
          ? "radial-gradient(circle at 30% 20%, rgba(239,68,68,0.12), transparent 50%), radial-gradient(circle at 70% 80%, rgba(251,146,60,0.10), transparent 50%), #0f0f0f"
          : "radial-gradient(circle at 30% 20%, rgba(239,68,68,0.07), transparent 50%), radial-gradient(circle at 70% 80%, rgba(251,146,60,0.07), transparent 50%)",
      }}>
        <div style={S.innerWide}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "5rem", alignItems: "center" }}>
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
              <div style={{ display: "inline-block", padding: "0.4rem 1rem", background: dm ? "rgba(239,68,68,0.15)" : "#fef2f2", color: "#dc2626", borderRadius: "9999px", fontSize: "0.9rem", marginBottom: "1.5rem", border: `1px solid ${dm ? "rgba(239,68,68,0.3)" : "#fee2e2"}` }}>
                Melbourne, VIC
              </div>
              <h1 style={{ fontSize: "3.5rem", fontWeight: 300, color: dm ? "#f9fafb" : "#111827", marginBottom: "0.5rem", lineHeight: 1.1, display: "flex", alignItems: "baseline", gap: "12px" }}>
                Alex Hofmann
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#dc2626", background: "rgba(220,38,38,0.1)", borderRadius: "5px", padding: "2px 7px", fontFamily: "monospace" }}>#76</span>
              </h1>
              <p style={{ fontSize: "1.35rem", color: dm ? "#9ca3af" : "#6b7280", marginBottom: "1.5rem" }}>Engineer</p>
              <p style={{ fontSize: "1.05rem", color: dm ? "#d1d5db" : "#374151", lineHeight: 1.8, marginBottom: "1rem" }}>
                Building, making, creating <span style={{ color: "#dc2626", fontWeight: 500 }}>cool things</span>.
              </p>
              <p style={{ fontSize: "1rem", color: dm ? "#9ca3af" : "#6b7280", lineHeight: 1.8, marginBottom: "1rem" }}>
                I'm moving with the times — building AI and building with AI to achieve faster outcomes than ever before.
              </p>
              <p style={{ fontSize: "1rem", color: dm ? "#9ca3af" : "#6b7280", lineHeight: 1.8, marginBottom: "1rem" }}>
                I'm adaptable, working from hardware electronics through to full-stack software - whatever the tool needed, I identify it quickly and I learn it quickly.
              </p>
              <p style={{ fontSize: "1rem", color: dm ? "#9ca3af" : "#6b7280", lineHeight: 1.8, marginBottom: "1rem" }}>
                I've taught final year university students the fundamentals of AI in the morning and watched on as my unmanned vehicle vision system autonomously drives down a road in the afternoon. I enjoy a challenge, things like debugging, building and pushing the latest apk over the air to devices in Singapore while on a walk around the block.
              </p>
              <p style={{ fontSize: "1rem", color: dm ? "#9ca3af" : "#6b7280", lineHeight: 1.8, marginBottom: "2rem" }}>
                I've been an R&D Engineer / Forward Deployed Engineer / Full Stack Developer /  Team Lead in complex mechatronics environments across project lifecycles, predominantly within the defense industry.

              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ── */}
      <section style={{ ...S.section, background: dm ? "#0f0f0f" : "#fff" }}>
        <div style={S.inner}>
          <Heading title="Experience" c1="#ef4444" c2="#f97316" dark={dm} />

          {/* ── Work ── */}
          <div style={{ position: "relative", marginBottom: "5rem" }}>
            <div style={{ position: "absolute", left: "28px", top: 0, bottom: 0, width: "2px", background: "linear-gradient(to bottom, #ef4444, #f97316, #f59e0b)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
              {WORK_PATHS.map((pathId, i) => {
                const w = PATH_DATA[pathId];
                const v = WORK_VISUAL[pathId];
                if (!w || !v) return null;
                return (
                  <motion.div key={pathId} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    style={{ position: "relative", paddingLeft: "5rem" }}>
                    <div style={{ position: "absolute", left: "20px", top: "2rem", width: "18px", height: "18px", borderRadius: "50%", background: `linear-gradient(135deg, ${v.color}, ${v.color2})`, border: `3px solid ${dm ? "#0f0f0f" : "#fff"}`, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />
                    <div style={{ background: dm ? "#1a1a1a" : "#fff", borderRadius: "1.5rem", overflow: "hidden", border: `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}`, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", display: "flex" }}>
                      {/* Photo / placeholder */}
                      <div style={{ width: "200px", flexShrink: 0, position: "relative", borderRight: `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}`, background: `linear-gradient(135deg, ${v.color}22, ${v.color2}11)` }}>
                        {v.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={v.photo} alt={w.company} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
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
                            <h3 style={{ fontSize: "1.4rem", fontWeight: 600, color: dm ? "#f9fafb" : "#111827", marginBottom: "0.3rem", display: "flex", alignItems: "center", gap: "8px" }}>
                              {w.role ?? w.name}
                              <span style={{ fontSize: "10px", fontWeight: 700, color: v.color, background: `${v.color}18`, borderRadius: "4px", padding: "2px 6px", fontFamily: "monospace" }}>#{pathId}</span>
                            </h3>
                            <p style={{ fontSize: "1.05rem", fontWeight: 500, background: `linear-gradient(to right, ${v.color}, ${v.color2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{w.company}</p>
                          </div>
                          <span style={{ padding: "0.4rem 1rem", background: dm ? "#111" : "#f9fafb", color: dm ? "#9ca3af" : "#6b7280", borderRadius: "9999px", fontSize: "0.85rem", whiteSpace: "nowrap", border: `1px solid ${dm ? "#2a2a2a" : "#e5e7eb"}` }}>{w.date}</span>
                        </div>
                        <p style={{ fontSize: "1rem", color: dm ? "#9ca3af" : "#6b7280", lineHeight: 1.75, marginBottom: w.tags?.length ? "1.25rem" : 0 }}>{w.description}</p>
                        {w.tags && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {w.tags.map(t => (
                              <span key={t} style={{ padding: "0.35rem 0.75rem", background: dm ? "#111" : "#f9fafb", color: dm ? "#d1d5db" : "#374151", borderRadius: "0.5rem", fontSize: "0.875rem", border: `1px solid ${dm ? "#2a2a2a" : "#e5e7eb"}` }}>{t}</span>
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

          {/* ── Hackathons ── */}
          <div style={{ marginBottom: "0", position: "relative" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 300, color: dm ? "#f9fafb" : "#111827", marginBottom: "0.75rem", textAlign: "center" }}>Hackathons &amp; Competitions</h3>
            <div style={{ height: "3px", width: "60px", borderRadius: "9999px", background: "linear-gradient(to right, #10b981, #6366f1)", margin: "0 auto 2.5rem" }} />

            <div style={{ position: "relative", height: "480px", display: "flex", alignItems: "center", justifyContent: "center", perspective: "1000px", width: "100%", overflow: "hidden" }}>

              <button
                onClick={() => setActiveHackathon((prev) => (prev - 1 + HACKATHON_PATHS.length) % HACKATHON_PATHS.length)}
                style={{ position: "absolute", left: "1rem", zIndex: 50, background: dm ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", color: dm ? "#fff" : "#000", cursor: "pointer", transition: "all 0.2s" }}
              >
                <ChevronLeft size={28} />
              </button>

              <button
                onClick={() => setActiveHackathon((prev) => (prev + 1) % HACKATHON_PATHS.length)}
                style={{ position: "absolute", right: "1rem", zIndex: 50, background: dm ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", color: dm ? "#fff" : "#000", cursor: "pointer", transition: "all 0.2s" }}
              >
                <ChevronRight size={28} />
              </button>

              <div style={{ position: "relative", width: "100%", maxWidth: "340px", height: "100%" }}>
                {HACKATHON_PATHS.map((pathId, i) => {
                  const h = PATH_DATA[pathId];
                  const v = HACKATHON_VISUAL[pathId];
                  if (!h || !v) return null;

                  // Calculate distance from active index, wrapping around
                  let offset = i - activeHackathon;
                  if (offset > HACKATHON_PATHS.length / 2) offset -= HACKATHON_PATHS.length;
                  if (offset < -HACKATHON_PATHS.length / 2) offset += HACKATHON_PATHS.length;

                  const isActive = offset === 0;
                  const isVisible = Math.abs(offset) <= 1; // Only show +/- 1 card

                  return (
                    <motion.div
                      key={pathId}
                      animate={{
                        x: `calc(-50% + ${offset * 120}%)`,
                        y: "-50%",
                        scale: isActive ? 1 : 0.85,
                        opacity: isActive ? 1 : (isVisible ? 0.3 : 0),
                        zIndex: isActive ? 10 : 5 - Math.abs(offset),
                        rotateY: offset * -15
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{ position: "absolute", top: "50%", left: "50%", width: "100%", background: dm ? "#1a1a1a" : "#fff", borderRadius: "1.25rem", overflow: "hidden", border: `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}`, boxShadow: isActive ? "0 12px 32px rgba(0,0,0,0.15)" : "0 4px 16px rgba(0,0,0,0.06)", pointerEvents: isActive ? "auto" : "none" }}
                    >
                      <div style={{ height: "5px", background: `linear-gradient(to right, ${v.color}, ${v.color2})` }} />
                      <div style={{ padding: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.6rem" }}>
                          <h4 style={{ fontSize: "1rem", fontWeight: 700, color: dm ? "#f9fafb" : "#111827", lineHeight: 1.3, display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            {h.role ?? h.name}
                            <span style={{ fontSize: "10px", fontWeight: 700, color: v.color, background: `${v.color}18`, borderRadius: "4px", padding: "1px 5px", fontFamily: "monospace", flexShrink: 0 }}>#{pathId}</span>
                          </h4>
                          <span style={{ padding: "0.25rem 0.7rem", background: `${v.color}20`, color: v.color, borderRadius: "9999px", fontSize: "0.78rem", whiteSpace: "nowrap", fontWeight: 600, flexShrink: 0 }}>{h.date}</span>
                        </div>
                        <p style={{ fontSize: "0.85rem", fontWeight: 500, color: dm ? "#9ca3af" : "#6b7280", marginBottom: "0.75rem" }}>{h.company}</p>
                        <p style={{ fontSize: "0.9rem", color: dm ? "#9ca3af" : "#4b5563", lineHeight: 1.5, marginBottom: "1rem" }}>{h.description}</p>
                        {h.items && h.items.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                            {h.items.map((item, ii) => typeof item === "string" ? null : (
                              <span key={ii} style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", background: dm ? "#222" : "#f3f4f6", color: dm ? "#d1d5db" : "#374151", borderRadius: "9999px", border: `1px solid ${dm ? "#333" : "#e5e7eb"}` }}>
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
          </div>

        </div>
      </section>

      {/* ── EDUCATION ── */}
      <section style={{ ...S.section, background: dm ? "linear-gradient(135deg, #111 0%, #1a0a0a 100%)" : "linear-gradient(135deg, #fafafa 0%, #fff5f5 100%)" }}>
        <div style={S.inner}>
          <Heading title="Education" c1="#f97316" c2="#ef4444" dark={dm} />
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {EDUCATION.map((edu, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ background: dm ? "#1a1a1a" : "#fff", borderRadius: "1.5rem", overflow: "hidden", border: `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}`, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
                <div style={{ height: "6px", background: `linear-gradient(to right, ${edu.color}, ${edu.color2})` }} />
                <div style={{ padding: "2.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "0.75rem" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: "1.4rem", fontWeight: 600, color: dm ? "#f9fafb" : "#111827", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "8px" }}>
                        {edu.degree}
                        <span style={{ fontSize: "10px", fontWeight: 700, color: edu.color, background: `${edu.color}18`, borderRadius: "4px", padding: "2px 6px", fontFamily: "monospace", flexShrink: 0 }}>#{edu.path}</span>
                      </h3>
                      <p style={{ fontSize: "1.05rem", fontWeight: 500, background: `linear-gradient(to right, ${edu.color}, ${edu.color2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{edu.school}</p>
                    </div>
                    <span style={{ padding: "0.4rem 1.2rem", background: dm ? "#111" : "#f9fafb", color: dm ? "#9ca3af" : "#6b7280", borderRadius: "9999px", fontSize: "0.85rem", whiteSpace: "nowrap", border: `1px solid ${dm ? "#2a2a2a" : "#e5e7eb"}` }}>{edu.period}</span>
                  </div>
                  <p style={{ fontSize: "1rem", color: "#9ca3af", marginBottom: "1.5rem", whiteSpace: "pre-wrap" }}>{edu.description}</p>
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section style={{ ...S.section, background: dm ? "linear-gradient(135deg, #111 0%, #0a0a1a 100%)" : "linear-gradient(135deg, #fafafa 0%, #f0f9ff 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 30%, rgba(99,102,241,0.05), transparent 50%), radial-gradient(circle at 30% 70%, rgba(59,130,246,0.05), transparent 50%)", pointerEvents: "none" }} />
        <div style={{ ...S.innerWide, position: "relative" }}>
          <Heading title="Projects" c1="#6366f1" c2="#ec4899" dark={dm} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.75rem" }}>
            {projects.map((proj, i) => (
              <motion.div key={proj.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                style={{ background: dm ? "#1a1a1a" : "#fff", borderRadius: "1.5rem", overflow: "hidden", border: `2px solid ${dm ? "#2a2a2a" : "#f3f4f6"}`, transition: "transform 0.25s, box-shadow 0.25s", cursor: "default" }}
                whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}>
                {/* Colour banner */}
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
      </section>

      {/* ── INTERESTS ── */}
      <section style={{ ...S.section, background: dm ? "#0f0f0f" : "#fff" }}>
        <div style={S.inner}>
          <Heading title="Interests" c1="#ef4444" c2="#ec4899" dark={dm} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
            {INTEREST_PATHS.map((pathId, i) => {
              const interest = PATH_DATA[pathId];
              if (!interest) return null;
              const items = getInterestItems(pathId);
              return <InterestCard key={pathId} pathId={pathId} interest={interest} items={items} dm={dm} i={i} />;
            })}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section style={{ ...S.section, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #111827 0%, #1e1b4b 50%, #312e81 100%)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(239,68,68,0.08), transparent 60%)", pointerEvents: "none" }} />
        <div style={{ ...S.inner, position: "relative" }}>
          <Heading title="Let's Connect" c1="#ef4444" c2="#f97316" center dark />

          <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: "2rem" }}>
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
                    <div style={{ width: "52px", height: "52px", borderRadius: "0.875rem", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: item.color, marginBottom: "2px" }}>{item.label}</div>
                      <div style={{ fontSize: "0.95rem", color: "#fff" }}>{item.value}</div>
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
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
    </div>
  );
}
