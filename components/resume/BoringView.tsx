"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  GraduationCap,
  Briefcase,
  Code,
  Send,
  ArrowUpRight,
  Cpu,
  Layers,
  Zap,
  Box
} from "lucide-react";
import { type Project } from "@/lib/projects";
import "./BoringView.css";

interface BoringViewProps {
  projects: Project[];
  age: number;
}

const WORK = [
  { title: "Chief Engineer", company: "Fortifyedge", period: "2024 — Present", note: "Leading engineering for Human Monitoring on Ruggedized Edge devices." },
  { title: "Software Systems Engineer", company: "Tonbo Systems", period: "2023", note: "Integrated tactical sensors into Augmented Reality and HUD systems." },
  { title: "Engineer", company: "DefendTex", period: "2022 — 2023", note: "R&D focused on Navigation systems for Unmanned Ground Vehicles." },
];

const INTERESTS = [
  { name: "Tactical UI/UX", icon: <Layers size={14} />, note: "Heads-up display and high-stress interface design." },
  { name: "Embedded Systems", icon: <Cpu size={14} />, note: "Performance optimization for bare-metal hardware." },
  { name: "Hardware Design", icon: <Box size={14} />, note: "CAD and rapid prototyping for physical devices." },
  { name: "Systems Logic", icon: <Zap size={14} />, note: "Formal verification and high-reliability systems." },
];

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
    <div className="boring-container">
      {/* Visual background noise/texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] mix-blend-multiply z-[-1]" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} 
      />
      
      <div className="max-w-6xl mx-auto px-6 py-20 lg:py-32 space-y-40">
        
        {/* ── ORIGIN SECTION ── */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-16"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Identity", value: "Alex H.", icon: <Sparkles size={14} /> },
              { label: "Lifecycle", value: `${age} Years`, icon: <Calendar size={14} /> },
              { label: "Sector", value: "Melbourne", icon: <MapPin size={14} /> },
              { label: "Status", value: "Available", icon: <div className="led led-green" /> },
            ].map((stat, i) => (
              <div key={i} className="stat-card p-8 group">
                <div className="flex items-center justify-between mb-4">
                  <span className="readout text-[8px] opacity-60 group-hover:opacity-100 transition-opacity">{stat.label}</span>
                  <div className="text-text-dim group-hover:text-accent transition-colors">{stat.icon}</div>
                </div>
                <div className="text-lg font-bold tracking-tight text-text">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="max-w-4xl space-y-8">
            <div className="readout"><div className="w-1.5 h-1.5 bg-accent" /> Origin Brief</div>
            <div className="space-y-6">
              <p className="text-2xl lg:text-3xl font-bold text-text-muted leading-[1.3] tracking-tighter">
                Engineer building redundant systems for <span className="text-text">high-stakes physical environments</span>. 
                I bridge the gap between bare-metal hardware and cloud-scale intelligence.
              </p>
              <p className="text-text-dim text-lg leading-relaxed max-w-3xl">
                Formerly leading R&D in Australian Defense sectors, now focusing on the intersection 
                of tactical UI/UX and autonomous system monitoring.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── FOCUS VECTORS ── */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="readout"><div className="w-1.5 h-1.5 bg-accent" /> Focus Vectors</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INTERESTS.map((interest, i) => (
              <div key={i} className="interest-item p-8 bg-surface border border-border hover:border-accent/20">
                <div className="mb-6 text-accent">{interest.icon}</div>
                <div className="text-xs font-black uppercase tracking-widest mb-3 truncate">{interest.name}</div>
                <p className="text-[12px] text-text-muted leading-relaxed">{interest.note}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── EXPERIENCE + EDUCATION ── */}
        <div className="grid lg:grid-cols-2 gap-32">
          {/* Experience */}
          <motion.section 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-16"
          >
            <div className="readout"><Briefcase size={12} /> Deployment log</div>
            <div className="space-y-12 border-l border-border pl-10 ml-2">
              {WORK.map((w, i) => (
                <div key={i} className="timeline-item group">
                  <div className="timeline-node" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="text-sm font-black text-text uppercase tracking-tight">{w.title}</div>
                    <div className="readout text-[8px] opacity-40">{w.period}</div>
                  </div>
                  <div className="text-xs font-bold text-accent mb-4 tracking-wider">{w.company}</div>
                  <p className="text-[13px] text-text-dim leading-relaxed">{w.note}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Education */}
          <motion.section 
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-16"
          >
            <div className="readout"><GraduationCap size={12} /> Academic Root</div>
            <div className="space-y-4">
              {[
                { deg: "Master of Electrical Engineering", sub: "Autonomous Systems Focus", context: "Monash University" },
                { deg: "Bachelor of Mechatronics & Robotics", sub: "Artificial Intelligence Major", context: "Monash University" },
                { deg: "Software Engineering Certification", sub: "Professional Accreditation", context: "IEEE Standards" },
              ].map((edu, i) => (
                <div key={i} className="p-8 bg-surface border border-border border-l-2 border-l-accent hover:bg-white transition-colors">
                  <div className="text-sm font-black text-text uppercase tracking-tight">{edu.deg}</div>
                  <div className="text-[10px] text-accent font-bold mt-1 mb-3">{edu.sub}</div>
                  <div className="readout text-[8px] opacity-50">{edu.context}</div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* ── OPERATIONS (PROJECTS) ── */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-16"
        >
          <div className="readout"><Code size={12} /> Live Operations</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(proj => (
              <div key={proj.id} className="project-card p-10 border border-border group relative flex flex-col">
                <div className="flex justify-between items-start mb-10">
                  <h3 className="text-lg font-black text-text group-hover:text-accent transition-colors uppercase tracking-tight">
                    {proj.name}
                  </h3>
                  <a href={`https://github.com/${proj.repo}`} target="_blank" className="text-text-dim hover:text-accent transition-all transform hover:scale-110">
                    <Code size={20} />
                  </a>
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-12 flex-grow">
                  {proj.tagline}
                </p>
                <div className="flex flex-wrap gap-2 mb-10">
                  {proj.tags.map(t => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
                {proj.firebase && (
                  <a 
                    href={proj.firebase} 
                    target="_blank" 
                    className="flex items-center gap-2 text-[10px] font-black text-accent opacity-60 group-hover:opacity-100 transition-all"
                  >
                    DEPLOYED INSTANCE <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── CONTACT ── */}
        <section id="contact" className="grid lg:grid-cols-2 gap-24 py-20 border-t border-border">
          <div className="space-y-12">
            <div className="readout">Direct Uplink</div>
            <h2 className="text-5xl lg:text-6xl font-black tracking-[calc(-0.05em)] text-text uppercase leading-[0.9]">
              Establish<br />
              <span className="text-accent underline decoration-accent/10">Synchrony</span>
            </h2>
            <p className="text-text-dim text-lg leading-relaxed max-w-sm">
              Available for technical strategy, embedded intelligence, or collaborative R&D projects.
            </p>
            <div className="flex flex-col gap-6">
              <a href="mailto:alex@hoffswitch.com" className="flex items-center gap-4 text-sm font-bold text-text hover:text-accent transition-colors">
                <div className="w-12 h-12 border border-border flex items-center justify-center rounded-sm group-hover:bg-accent/5">
                  <Mail size={18} />
                </div>
                alex@hoffswitch.com
              </a>
              <div className="flex items-center gap-4 text-sm font-bold text-text-muted">
                <div className="w-12 h-12 border border-border flex items-center justify-center rounded-sm">
                  <MapPin size={18} />
                </div>
                Melbourne, VIC
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border p-10 lg:p-12">
            {sent ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center space-y-8">
                <div className="w-20 h-20 border-2 border-accent flex items-center justify-center rounded-full text-accent">
                  <Send size={32} />
                </div>
                <div>
                  <div className="text-xl font-black uppercase mb-2">Transmission Received</div>
                  <p className="text-text-dim text-sm">Acknowledged. Stand by for response.</p>
                </div>
                <button onClick={() => setSent(false)} className="text-[10px] font-black border-b border-accent text-accent mt-8 tracking-widest">RE-ESTABLISH</button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="readout opacity-50">Origin Node</label>
                    <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input w-full p-4 text-xs font-mono outline-none" placeholder="IDENTIFIER" />
                  </div>
                  <div className="space-y-2">
                    <label className="readout opacity-50">Return Address</label>
                    <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="form-input w-full p-4 text-xs font-mono outline-none" placeholder="EMAIL" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="readout opacity-50">Channel Topic</label>
                  <input type="text" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="form-input w-full p-4 text-xs font-mono outline-none" placeholder="SUBJECT" />
                </div>
                <div className="space-y-2">
                  <label className="readout opacity-50">Payload</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="form-input w-full p-4 text-xs font-mono outline-none resize-none" placeholder="TRANSMISSION CONTENT..." />
                </div>
                {formError && <div className="text-[10px] text-accent font-bold uppercase">{formError}</div>}
                <button type="submit" disabled={sending} className="submit-button w-full bg-accent text-white py-5 flex items-center justify-center gap-3 text-[11px] disabled:opacity-50">
                  {sending ? "TRANSMITTING..." : "COMMIT TRANSMISSION"} <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="py-20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="readout opacity-40">© 2025 HOFFSWITCH // V.2.0.4</div>
          <div className="flex gap-8">
             <a href="#" className="readout hover:text-accent transition-colors">Documentation</a>
             <a href="#" className="readout hover:text-accent transition-colors">Legal</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
