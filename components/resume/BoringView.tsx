"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Send } from "lucide-react";
import { type Project } from "@/lib/projects";

interface BoringViewProps {
  projects: Project[];
  age: number;
}

const WORK = [
  {
    title: "Project Lead",
    company: "Fortifyedge",
    period: "2025 — NOW",
    note: "Integrating thermal sights with Team Awareness Kit (TAK) for situational awareness systems. Responsible for hardware selection, embedded firmware, and customer requirement derivation.",
    tags: ["Hardware", "Embedded", "TAK", "Firmware"],
    color: "#ef4444",
    color2: "#f97316",
  },
  {
    title: "Software Systems Engineer",
    company: "Tonbo Systems",
    period: "2024 — 2025",
    note: "Delivering network-connected future soldier system kits. Work spans hardware integration, software architecture, and translating operational requirements into engineering specifications.",
    tags: ["Systems", "Software", "Hardware Integration"],
    color: "#f97316",
    color2: "#f59e0b",
  },
  {
    title: "Electronics & Software Engineer",
    company: "DefendTex",
    period: "2022 — 2024",
    note: "Developed the autonomy subsystem for an unmanned ground vehicle — from hardware bring-up and thermal object detection through to GStreamer pipelines and ArduPilot integration.",
    tags: ["Autonomy", "Computer Vision", "ArduPilot", "GStreamer"],
    color: "#f59e0b",
    color2: "#eab308",
  },
];

const EDUCATION = [
  {
    degree: "Master of Electrical Engineering",
    school: "Monash University",
    period: "2024",
    description: "",
    achievements: ["Academic Medal Winner 2024"],
    color: "#ef4444",
    color2: "#f43f5e",
  },
  {
    degree: "Bachelor of Robotics and Mechatronics Engineering",
    school: "Monash University",
    period: "2020 – 2023",
    description: "Minor: Software Engineering",
    achievements: ["Specialization: Artificial Intelligence", "Dean's Honour List 2020–2023"],
    color: "#f97316",
    color2: "#ef4444",
  },
];

const INTERESTS = [
  { title: "Golf", subtitle: "HCP 38 · Berwick Montuna Golf Club" },
  { title: "Photography", subtitle: "@alexhofmannphotography" },
  { title: "Board Games", subtitle: "Dune Imperium · Wingspan · Ark Nova" },
  { title: "Reading", subtitle: "Brotherband Series · Wolf of the Plains · Courtney Series" },
  { title: "Art", subtitle: "Hans Heysen · Albert Namatjira · Matthew Bell" },
  { title: "Craft", subtitle: "Sewing · Embroidery · Crochet" },
  { title: "Saxophone", subtitle: "Alto · Baritone" },
  { title: "Movies", subtitle: "Ocean's Eleven · Lord of the Rings · Pirates of the Caribbean" },
];

const SKILLS = ["Embedded Systems", "Computer Vision", "ArduPilot", "TAK", "Python", "C/C++", "React", "Next.js"];

const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width={size} height={size}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width={size} height={size}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.981 0 1.771-.773 1.771-1.729V1.729C24 .774 23.207 0 22.225 0z" />
  </svg>
);

const S = {
  font: "var(--font-inter), system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
  section: { padding: "7rem clamp(1.5rem, 6vw, 6rem)" },
  inner: { maxWidth: "1100px", margin: "0 auto" },
  innerWide: { maxWidth: "1280px", margin: "0 auto" },
  heading: { fontSize: "3rem", fontWeight: 300, color: "#111827", marginBottom: "1rem", lineHeight: 1.15 },
  bar: (color1: string, color2: string) => ({
    height: "6px", width: "96px", borderRadius: "9999px",
    background: `linear-gradient(to right, ${color1}, ${color2})`,
    marginBottom: "4rem",
  }),
};

function Heading({ title, c1, c2, center }: { title: string; c1: string; c2: string; center?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      style={{ marginBottom: "4rem", textAlign: center ? "center" : "left" }}>
      <h2 style={S.heading}>{title}</h2>
      <div style={{ ...S.bar(c1, c2), ...(center ? { margin: "0 auto 4rem" } : {}) }} />
    </motion.div>
  );
}

export default function BoringView({ projects, age }: BoringViewProps) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFormError("");
    try {
      const res = await fetch(`https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { setSent(true); }
      else { setFormError("Submission error. Please email directly."); }
    } catch {
      setFormError("Network failure. Please email directly.");
    } finally { setSending(false); }
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#fff", color: "#111827", fontFamily: S.font, fontSize: "16px" }}>

      {/* ── ABOUT ── */}
      <section style={{
        ...S.section,
        position: "relative",
        overflow: "hidden",
        background: "radial-gradient(circle at 30% 20%, rgba(239,68,68,0.07), transparent 50%), radial-gradient(circle at 70% 80%, rgba(251,146,60,0.07), transparent 50%)",
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
                <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "1.5rem", overflow: "hidden", border: "2px solid #f3f4f6", boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/alex.jpeg" alt="Alex Hofmann" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </div>
            </motion.div>

            {/* Bio */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div style={{ display: "inline-block", padding: "0.4rem 1rem", background: "#fef2f2", color: "#dc2626", borderRadius: "9999px", fontSize: "0.9rem", marginBottom: "1.5rem", border: "1px solid #fee2e2" }}>
                Melbourne, VIC · Open to opportunities
              </div>
              <h1 style={{ fontSize: "3.5rem", fontWeight: 300, color: "#111827", marginBottom: "0.5rem", lineHeight: 1.1 }}>Alex Hofmann</h1>
              <p style={{ fontSize: "1.35rem", color: "#6b7280", marginBottom: "1.5rem" }}>Electronics & Software Engineer</p>
              <p style={{ fontSize: "1.05rem", color: "#374151", lineHeight: 1.8, marginBottom: "1rem" }}>
                Building <span style={{ color: "#dc2626", fontWeight: 500 }}>resilient systems</span> for forward-deployed environments — across hardware, software, and everything in between.
              </p>
              <p style={{ fontSize: "1rem", color: "#6b7280", lineHeight: 1.8, marginBottom: "2rem" }}>
                I work across the full stack of a system: from hardware selection and bring-up, through embedded and application software, to working directly with customers to derive requirements and shape what gets built.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {SKILLS.map(s => (
                  <span key={s} style={{ padding: "0.4rem 1rem", background: "#fff", border: "2px solid #e5e7eb", borderRadius: "9999px", fontSize: "0.9rem", color: "#4b5563" }}>{s}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ── */}
      <section style={{ ...S.section, background: "#fff" }}>
        <div style={S.inner}>
          <Heading title="Experience" c1="#ef4444" c2="#f97316" />
          <div style={{ position: "relative" }}>
            {/* Timeline line */}
            <div style={{ position: "absolute", left: "28px", top: 0, bottom: 0, width: "2px", background: "linear-gradient(to bottom, #ef4444, #f97316, #f59e0b)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
              {WORK.map((w, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  style={{ position: "relative", paddingLeft: "5rem" }}>
                  {/* Dot */}
                  <div style={{
                    position: "absolute", left: "20px", top: "2rem", width: "18px", height: "18px", borderRadius: "50%",
                    background: `linear-gradient(135deg, ${w.color}, ${w.color2})`,
                    border: "3px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }} />
                  <div style={{ background: "#fff", borderRadius: "1.5rem", padding: "2rem", border: "2px solid #f3f4f6", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", transition: "box-shadow 0.3s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "0.75rem" }}>
                      <div>
                        <h3 style={{ fontSize: "1.4rem", fontWeight: 600, color: "#111827", marginBottom: "0.3rem" }}>{w.title}</h3>
                        <p style={{ fontSize: "1.05rem", fontWeight: 500, background: `linear-gradient(to right, ${w.color}, ${w.color2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{w.company}</p>
                      </div>
                      <span style={{ padding: "0.4rem 1rem", background: "#f9fafb", color: "#6b7280", borderRadius: "9999px", fontSize: "0.85rem", whiteSpace: "nowrap", border: "1px solid #e5e7eb" }}>{w.period}</span>
                    </div>
                    <p style={{ fontSize: "1rem", color: "#6b7280", lineHeight: 1.75, marginBottom: "1.25rem" }}>{w.note}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {w.tags.map(t => (
                        <span key={t} style={{ padding: "0.35rem 0.75rem", background: "#f9fafb", color: "#374151", borderRadius: "0.5rem", fontSize: "0.875rem", border: "1px solid #e5e7eb" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EDUCATION ── */}
      <section style={{ ...S.section, background: "linear-gradient(135deg, #fafafa 0%, #fff5f5 100%)" }}>
        <div style={S.inner}>
          <Heading title="Education" c1="#f97316" c2="#ef4444" />
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {EDUCATION.map((edu, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ background: "#fff", borderRadius: "1.5rem", overflow: "hidden", border: "2px solid #f3f4f6", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
                <div style={{ height: "6px", background: `linear-gradient(to right, ${edu.color}, ${edu.color2})` }} />
                <div style={{ padding: "2.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "0.75rem" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: "1.4rem", fontWeight: 600, color: "#111827", marginBottom: "0.4rem" }}>{edu.degree}</h3>
                      <p style={{ fontSize: "1.05rem", fontWeight: 500, background: `linear-gradient(to right, ${edu.color}, ${edu.color2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{edu.school}</p>
                    </div>
                    <span style={{ padding: "0.4rem 1.2rem", background: "#f9fafb", color: "#6b7280", borderRadius: "9999px", fontSize: "0.85rem", whiteSpace: "nowrap", border: "1px solid #e5e7eb" }}>{edu.period}</span>
                  </div>
                  <p style={{ fontSize: "1rem", color: "#9ca3af", marginBottom: "1.5rem" }}>{edu.description}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                    {edu.achievements.map((a, ai) => (
                      <div key={ai} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.1rem", background: "#f9fafb", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
                        <svg style={{ width: "18px", height: "18px", color: "#ef4444", flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span style={{ fontSize: "0.95rem", color: "#374151" }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERESTS ── */}
      <section style={{ ...S.section, background: "#fff" }}>
        <div style={S.inner}>
          <Heading title="Interests" c1="#ef4444" c2="#ec4899" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
            {INTERESTS.map((interest, i) => (
              <motion.div key={interest.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                style={{ background: "#fff", borderRadius: "1rem", padding: "1.5rem", border: "2px solid #f3f4f6", transition: "border-color 0.2s, box-shadow 0.2s" }}
                whileHover={{ borderColor: "#fecaca", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", marginBottom: "0.4rem" }}>{interest.title}</div>
                <div style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: 1.6 }}>{interest.subtitle}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section style={{ ...S.section, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #111827 0%, #1e1b4b 50%, #312e81 100%)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(239,68,68,0.08), transparent 60%)", pointerEvents: "none" }} />
        <div style={{ ...S.inner, position: "relative" }}>
          <Heading title="Get in Touch" c1="#ef4444" c2="#f97316" center />

          <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: "2rem" }}>
            {/* Links panel */}
            <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", borderRadius: "1.5rem", padding: "2rem", border: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 style={{ fontSize: "1.3rem", color: "#fff", fontWeight: 300, marginBottom: "2rem" }}>Direct Lines</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {[
                  { href: "mailto:alexanderhofmann@outlook.com.au", icon: <Mail size={22} />, label: "Email", value: "alexanderhofmann@outlook.com.au", bg: "rgba(239,68,68,0.15)", color: "#fca5a5" },
                  { href: "https://github.com/switchhoff", icon: <GithubIcon size={22} />, label: "GitHub", value: "switchhoff", bg: "rgba(255,255,255,0.08)", color: "#d1d5db" },
                  { href: "https://linkedin.com/in/hofmannalexb/", icon: <LinkedinIcon size={22} />, label: "LinkedIn", value: "hofmannalexb", bg: "rgba(59,130,246,0.15)", color: "#93c5fd" },
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
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "0.875rem", background: "rgba(251,146,60,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fdba74", flexShrink: 0 }}>
                    <MapPin size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#fdba74", marginBottom: "2px" }}>Location</div>
                    <div style={{ fontSize: "0.95rem", color: "#fff" }}>Melbourne, VIC</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ background: "#fff", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
              {sent ? (
                <div style={{ textAlign: "center", padding: "3rem 0" }}>
                  <Send style={{ margin: "0 auto 1rem", color: "#ef4444", width: 32, height: 32 }} />
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>Message sent!</h3>
                  <p style={{ fontSize: "0.95rem", color: "#9ca3af" }}>I'll get back to you shortly.</p>
                  <button onClick={() => setSent(false)} style={{ marginTop: "2rem", fontSize: "0.8rem", fontWeight: 700, borderBottom: "2px solid #ef4444", color: "#ef4444", textTransform: "uppercase", background: "none", padding: "0 0 2px" }}>Send another</button>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 500, color: "#111827", marginBottom: "1.75rem" }}>Send a Message</h3>
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      {[
                        { label: "Name", key: "name", type: "text", placeholder: "..." },
                        { label: "Email", key: "email", type: "email", placeholder: "..." },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{f.label}</label>
                          <input type={f.type} required placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                            style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "0.75rem", border: "2px solid #e5e7eb", background: "#f9fafb", fontSize: "1rem", outline: "none", transition: "border-color 0.2s" }}
                            onFocus={e => (e.target.style.borderColor = "#f87171")}
                            onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Subject</label>
                      <input type="text" required placeholder="..." value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                        style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "0.75rem", border: "2px solid #e5e7eb", background: "#f9fafb", fontSize: "1rem", outline: "none" }}
                        onFocus={e => (e.target.style.borderColor = "#f87171")}
                        onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Message</label>
                      <textarea rows={5} required placeholder="..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "0.75rem", border: "2px solid #e5e7eb", background: "#f9fafb", fontSize: "1rem", outline: "none", resize: "none" }}
                        onFocus={e => (e.target.style.borderColor = "#f87171")}
                        onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                    </div>
                    {formError && <p style={{ color: "#ef4444", fontSize: "0.9rem" }}>{formError}</p>}
                    <button type="submit" disabled={sending}
                      style={{ width: "100%", padding: "1rem", borderRadius: "0.75rem", background: "linear-gradient(135deg, #ef4444, #f97316)", color: "#fff", fontSize: "1rem", fontWeight: 600, border: "none", boxShadow: "0 4px 16px rgba(239,68,68,0.3)", transition: "box-shadow 0.2s" }}>
                      {sending ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: "#111827", color: "#6b7280", padding: "2rem", textAlign: "center", fontSize: "0.875rem" }}>
        © 2026 Alex Hofmann · hoffswitch
      </footer>
    </div>
  );
}
