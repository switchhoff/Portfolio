"use client";
import { useEffect, useRef } from "react";
import { type Project, statusColor, statusLabel } from "@/lib/projects";

interface Props {
  project: Project | null;
  onClose: () => void;
}

const colorVars = {
  cyan:   { accent: "var(--cyan)",   bg: "rgba(0,212,255,0.04)" },
  green:  { accent: "var(--green)",  bg: "rgba(0,255,136,0.04)" },
  copper: { accent: "#c87941",       bg: "rgba(200,121,65,0.04)" },
  orange: { accent: "var(--orange)", bg: "rgba(255,107,53,0.04)" },
};

export default function ProjectPanel({ project, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!project) return null;

  const c = colorVars[project.color];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(8,12,16,0.6)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="slide-in fixed right-0 top-0 h-full z-50 flex flex-col"
        style={{
          width: "min(420px, 100vw)",
          background: "var(--bg-secondary)",
          borderLeft: `1px solid ${c.accent}33`,
          boxShadow: `-20px 0 60px rgba(0,0,0,0.6), -1px 0 0 ${c.accent}22`,
        }}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="led"
              style={{ background: c.accent, color: c.accent }}
            />
            <span className="readout" style={{ color: "var(--text-muted)" }}>
              {project.zone}
            </span>
          </div>
          <button
            onClick={onClose}
            className="readout"
            style={{
              color: "var(--text-muted)",
              cursor: "pointer",
              background: "none",
              border: "none",
              letterSpacing: "0.1em",
              fontSize: "9px",
            }}
          >
            [ESC] CLOSE
          </button>
        </div>

        {/* Accent top strip */}
        <div style={{ height: "1px", background: `linear-gradient(90deg, ${c.accent}, transparent)`, opacity: 0.4 }} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">

          {/* Title */}
          <div>
            <h2
              className="text-glow"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "22px",
                fontWeight: 600,
                color: c.accent,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              {project.label}
            </h2>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                marginTop: "8px",
                lineHeight: 1.6,
              }}
            >
              {project.summary}
            </p>
          </div>

          {/* Status + tags */}
          <div className="flex flex-wrap gap-2 items-center">
            <span
              className="tag"
              style={{ color: statusColor[project.status], borderColor: `${statusColor[project.status]}66` }}
            >
              ● {statusLabel[project.status]}
            </span>
            {project.tags.map(t => (
              <span
                key={t}
                className="tag"
                style={{ color: "var(--text-muted)", borderColor: "var(--border-bright)" }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "var(--border)" }} />

          {/* Detail */}
          <div>
            <div className="readout" style={{ marginBottom: "10px" }}>Overview</div>
            <p style={{ fontSize: "12px", color: "var(--text)", lineHeight: 1.8, opacity: 0.8 }}>
              {project.detail}
            </p>
          </div>

          {/* Placeholder for future: stats, live data, media */}
          <div
            className="bracket"
            style={{
              background: c.bg,
              border: `1px solid ${c.accent}22`,
              padding: "16px",
              borderRadius: "2px",
            }}
          >
            <div className="readout" style={{ marginBottom: "10px", color: c.accent }}>
              Live Data
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.6 }}>
              Live integration coming soon — GitHub sync, device status, agent activity.
            </p>
          </div>

          {/* Links */}
          {project.links.length > 0 && (
            <div>
              <div className="readout" style={{ marginBottom: "10px" }}>Links</div>
              <div className="flex flex-col gap-2">
                {project.links.map(l => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "11px",
                      color: c.accent,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{ opacity: 0.5 }}>→</span>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom status bar */}
        <div
          className="px-6 py-3 flex items-center justify-between"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span className="readout">hoffswitch.com</span>
          <span className="readout" style={{ color: c.accent }}>
            sys:{project.id}
          </span>
        </div>
      </div>
    </>
  );
}
