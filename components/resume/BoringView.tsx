"use client";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  ExternalLink
} from "lucide-react";
import { type Project } from "@/lib/projects";
import "./BoringView.css";

interface BoringViewProps {
  projects: Project[];
  age: number;
}

const WORK = [
  {
    title: "Chief Engineer",
    company: "Fortifyedge",
    period: "2024 — Present",
    note: "Leading engineering for Human Monitoring on Ruggedized Edge devices."
  },
  {
    title: "Software Systems Engineer",
    company: "Tonbo Systems",
    period: "2023",
    note: "Integrated tactical sensors into Augmented Reality and HUD systems."
  },
  {
    title: "Engineer",
    company: "DefendTex",
    period: "2022 — 2023",
    note: "R&D focused on Navigation systems for Unmanned Ground Vehicles."
  },
];

const EDUCATION = [
  { deg: "Master of Electrical Engineering", sub: "Autonomous Systems Focus", uni: "Monash University" },
  { deg: "Bachelor of Mechatronics & Robotics", sub: "Artificial Intelligence Major", uni: "Monash University" },
];

const INTERESTS = [
  { label: "Tactical UI/UX", desc: "High-stress interface design for heads-up displays" },
  { label: "Embedded Systems", desc: "Performance optimization for bare-metal hardware" },
  { label: "Hardware Design", desc: "CAD and rapid prototyping for physical devices" },
  { label: "Systems Logic", desc: "Formal verification and high-reliability systems" },
];

export default function BoringView({ projects, age }: BoringViewProps) {
  return (
    <div style={{ background: "#f6f8f3", minHeight: "100vh" }} className="overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-200" style={{ background: "#ffffff" }}>
        <div className="max-w-5xl mx-auto px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-5xl font-bold tracking-tight mb-2" style={{ color: "#1a2e1f" }}>Alex Hofmann</h1>
              <p className="text-xl font-medium" style={{ color: "#5a7060" }}>Software Systems Engineer</p>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              <a href="mailto:alex@hoffswitch.com" className="flex items-center gap-2 hover:opacity-70 transition" style={{ color: "#2d5a3d" }}>
                <Mail size={16} />
                alex@hoffswitch.com
              </a>
              <div className="flex items-center gap-2" style={{ color: "#5a7060" }}>
                <MapPin size={16} />
                Melbourne, VIC
              </div>
              <div className="flex items-center gap-2" style={{ color: "#5a7060" }}>
                <span>Age {age}</span>
              </div>
            </div>

            <p className="text-base leading-relaxed max-w-3xl pt-6" style={{ color: "#5a7060" }}>
              Engineer building redundant systems for high-stakes physical environments. Specialized in bridging bare-metal hardware with cloud-scale intelligence. Former R&D lead in Australian Defense sectors; currently focused on tactical UI/UX and autonomous system monitoring.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-8 py-12">

        {/* Experience */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold mb-12" style={{ color: "#1a2e1f" }}>
            <Briefcase className="inline mr-3" size={24} style={{ color: "#2d5a3d" }} />
            Experience
          </h2>
          <div className="space-y-10">
            {WORK.map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="pb-8 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold" style={{ color: "#1a2e1f" }}>{w.title}</h3>
                  <span className="text-sm font-medium" style={{ color: "#9aaa94" }}>{w.period}</span>
                </div>
                <p className="text-sm font-semibold mb-3" style={{ color: "#2d5a3d" }}>{w.company}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#5a7060" }}>{w.note}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Skills / Interests */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold mb-12" style={{ color: "#1a2e1f" }}>
            Technical Interests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INTERESTS.map((int, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 border border-gray-200 bg-white rounded-sm"
              >
                <h3 className="font-bold mb-2" style={{ color: "#1a2e1f" }}>{int.label}</h3>
                <p className="text-sm" style={{ color: "#5a7060" }}>{int.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Education */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold mb-12" style={{ color: "#1a2e1f" }}>
            <GraduationCap className="inline mr-3" size={24} style={{ color: "#2d5a3d" }} />
            Education
          </h2>
          <div className="space-y-6">
            {EDUCATION.map((edu, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="pb-6 border-b border-gray-200 last:border-b-0"
              >
                <h3 className="text-base font-bold mb-1" style={{ color: "#1a2e1f" }}>{edu.deg}</h3>
                <p className="text-sm font-medium mb-2" style={{ color: "#2d5a3d" }}>{edu.sub}</p>
                <p className="text-sm" style={{ color: "#5a7060" }}>{edu.uni}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Projects */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold mb-12" style={{ color: "#1a2e1f" }}>
            <Code className="inline mr-3" size={24} style={{ color: "#2d5a3d" }} />
            Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map(proj => (
              <motion.a
                key={proj.id}
                href={proj.firebase || `https://github.com/${proj.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 border border-gray-200 bg-white rounded-sm hover:border-gray-400 hover:shadow-sm transition group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-base font-bold group-hover:text-opacity-70 transition" style={{ color: "#1a2e1f" }}>
                    {proj.name}
                  </h3>
                  <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition" style={{ color: "#2d5a3d" }} />
                </div>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: "#5a7060" }}>
                  {proj.tagline}
                </p>
                <div className="flex flex-wrap gap-2">
                  {proj.tags.slice(0, 3).map(t => (
                    <span key={t} className="text-[11px] px-2.5 py-1 rounded-full border" style={{ background: "#f6f8f3", borderColor: "#dce5d6", color: "#2d5a3d" }}>
                      {t}
                    </span>
                  ))}
                  {proj.tags.length > 3 && (
                    <span className="text-[11px] px-2.5 py-1" style={{ color: "#9aaa94" }}>
                      +{proj.tags.length - 3}
                    </span>
                  )}
                </div>
              </motion.a>
            ))}
          </div>
        </motion.section>

        {/* Contact CTA */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-16 border-t border-gray-200 text-center"
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: "#1a2e1f" }}>Let's Work Together</h2>
          <p className="text-base mb-6" style={{ color: "#5a7060" }}>Available for technical strategy, embedded systems, and collaborative R&D projects.</p>
          <a
            href="mailto:alex@hoffswitch.com"
            className="inline-block px-8 py-3 font-semibold rounded-sm transition hover:opacity-80"
            style={{ background: "#2d5a3d", color: "#ffffff" }}
          >
            Contact Me
          </a>
        </motion.section>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center" style={{ color: "#9aaa94" }}>
        <p className="text-xs">© 2025 Alex Hofmann. All rights reserved.</p>
      </footer>
    </div>
  );
}
