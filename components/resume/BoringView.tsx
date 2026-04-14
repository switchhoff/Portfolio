"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  ExternalLink,
  Send,
  MapPin
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

const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width={size} height={size}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width={size} height={size}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.981 0 1.771-.773 1.771-1.729V1.729C24 .774 23.207 0 22.225 0z"/>
  </svg>
);

const INTERESTS = [
  "Tactical UI/UX",
  "Embedded Systems",
  "Hardware Design",
  "Systems Logic",
  "Autonomous Nav",
  "Rapid Prototyping"
];

const EDUCATION = [
  { degree: "Master of Electrical Engineering", school: "Monash University", period: "2021 - 2023", details: "Autonomous Systems Focus" },
  { degree: "Bachelor of Mechatronics & Robotics", school: "Monash University", period: "2017 - 2021", details: "AI and Robotics Major" },
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
    <div className="min-h-screen w-full bg-white text-black">
      <div className="minimal-grid" />
      
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-[clamp(1.5rem, 5vw, 4rem)] py-[clamp(3rem, 10vh, 8rem)] space-y-[clamp(4rem, 15vh, 12rem)]">
        
        {/* ── SECTION 01: ABOUT ── */}
        <Section number="01" title="ABOUT ME">
          <div className="flex flex-col items-center justify-center gap-[clamp(2rem, 5vh, 4rem)] text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative w-[clamp(80px, 10vw, 120px)] aspect-square bg-gray-100 border border-minimal-border flex items-center justify-center"
            >
              <div className="absolute inset-0 border border-red-600 translate-x-[4px] translate-y-[4px] -z-10" />
              <div className="text-[clamp(8px, 0.8vw, 10px)] text-gray-400 font-mono tracking-tighter">
                [ALEX_H]
              </div>
            </motion.div>

            <div className="space-y-8 flex flex-col items-center">
              <div className="space-y-6 max-w-2xl">
                <p className="text-xl font-medium leading-relaxed">
                  I'm Alex Hofmann, a chief engineer focused on building <span className="text-red-600">resilient systems</span> for forward-deployed environments. 
                  I bridge the gap between firmware and high-level platforms.
                </p>
                <p className="text-sm text-gray-600 leading-7">
                  Currently based in Melbourne, specialized in Human Monitoring and tactical edge devices. 
                  My work combines rigorous engineering with intuitive systems logic.
                </p>
              </div>

              <div className="w-full max-w-2xl">
                <h3 className="text-xs font-bold text-red-600 mb-6 uppercase tracking-widest text-center">Interests</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {INTERESTS.map((interest, i) => (
                    <div key={interest} className="interest-tag">
                      <span className="interest-idx">[{String(i + 1).padStart(2, '0')}]</span>
                      <span className="text-xs uppercase font-semibold">{interest}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── SECTION 02: EXPERIENCE & EDUCATION ── */}
        <Section number="02" title="EXPERIENCE & EDUCATION">
          <div className="grid md:grid-cols-2 gap-[clamp(2rem, 5vw, 4rem)]">
            <div className="space-y-10">
              <h3 className="text-lg font-bold text-red-600 uppercase mb-8">Professional Timeline</h3>
              {WORK.map((w, i) => (
                <div key={i} className="exp-card">
                  <div className="exp-node" />
                  <h4 className="text-base font-bold uppercase">{w.title}</h4>
                  <div className="flex gap-4 items-center mt-1 mb-3">
                    <span className="text-red-600 text-[10px] font-bold uppercase">{w.company}</span>
                    <span className="text-gray-400 text-[10px] uppercase">{w.period}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-6">{w.note}</p>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              <h3 className="text-lg font-bold text-red-600 uppercase mb-8">Academic Root</h3>
              {EDUCATION.map((edu, i) => (
                <div key={i} className="edu-card">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold uppercase">{edu.degree}</h4>
                    <span className="text-[10px] text-gray-400">{edu.period}</span>
                  </div>
                  <p className="text-red-600 text-[10px] font-bold uppercase mb-2">{edu.school}</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{edu.details}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── SECTION 03: PROJECTS ── */}
        <Section number="03" title="LIVE OPERATIONS">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[clamp(1rem, 2vw, 2rem)]">
            {projects.map((proj, i) => (
              <div key={proj.id} className="proj-card">
                <div className="proj-image">
                  {proj.image ? (
                    <img src={proj.image} alt={proj.name} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300 uppercase">
                      [DATA_STREAM_{i}]
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <ExternalLink size={14} className="text-red-600 opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
                <div className="p-6 space-y-4 text-center flex flex-col items-center">
                  <h4 className="text-sm font-black uppercase flex flex-col items-center gap-2">
                    {proj.name}
                    <a href={`https://github.com/${proj.repo}`} target="_blank" className="hover:text-red-600 transition-colors">
                      <GithubIcon size={14} />
                    </a>
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed h-12 overflow-hidden text-center">
                    {proj.tagline}
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {proj.tags.map(t => <span key={t} className="proj-tech-tag">{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── SECTION 04: CONTACT ── */}
        <Section number="04" title="CONTACT">
          <div className="max-w-2xl mx-auto space-y-12">
            {sent ? (
              <div className="text-center py-12 border border-red-600 bg-red-600/5">
                <Send className="mx-auto mb-4 text-red-600" />
                <h3 className="text-lg font-bold uppercase mb-2">Transmission Received</h3>
                <p className="text-xs text-gray-500">I'll get back to you shortly.</p>
                <button onClick={() => setSent(false)} className="mt-8 text-[10px] font-bold border-b border-red-600 uppercase">Resend</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Node ID</label>
                    <input type="text" required placeholder="YOUR NAME" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="minimal-input" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Return URL</label>
                    <input type="email" required placeholder="EMAIL" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="minimal-input" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Channel Path</label>
                  <input type="text" required placeholder="SUBJECT" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="minimal-input" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Payload</label>
                  <textarea rows={5} required placeholder="MESSAGE..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="minimal-input resize-none" />
                </div>
                {formError && <p className="text-red-600 text-[10px] font-bold uppercase text-center">{formError}</p>}
                <button type="submit" disabled={sending} className="minimal-submit">
                  {sending ? "TRANSMITTING..." : "SEND MESSAGE"}
                </button>
              </form>
            )}

            <div className="flex flex-wrap justify-center gap-8 pt-8 opacity-60">
               <a href="mailto:alex@hoffswitch.com" className="flex items-center gap-2 text-[10px] font-bold hover:text-red-600">
                 <Mail size={12} /> alex@hoffswitch.com
               </a>
               <a href="https://github.com/switchhoff" className="flex items-center gap-2 text-[10px] font-bold hover:text-red-600 transition-colors">
                 <GithubIcon size={12} /> switchhoff
               </a>
               <a href="https://linkedin.com/in/hofmannalexb/" className="flex items-center gap-2 text-[10px] font-bold hover:text-red-600 transition-colors">
                 <LinkedinIcon size={12} /> linkedin
               </a>
               <div className="flex items-center gap-2 text-[10px] font-bold">
                 <MapPin size={12} /> Melbourne, VIC
               </div>
            </div>
          </div>
        </Section>

        <footer className="pt-24 pb-8 flex justify-between items-center opacity-30 text-[10px] font-bold uppercase tracking-widest border-t border-minimal-border">
          <div>© 2025 HOFFSWITCH </div>
          <div className="flex gap-4">
            <a href="#">Security</a>
            <a href="#">Protocol</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string, children: React.ReactNode }) {
  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <div className="section-marker">
          <span className="section-number">{number}</span>
          <div className="section-line" />
        </div>
        <h2 className="section-title">{title}</h2>
      </motion.div>
      {children}
    </section>
  );
}
