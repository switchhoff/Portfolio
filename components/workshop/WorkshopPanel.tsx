"use client";
import { useEffect } from "react";
import { type Hotspot, hotspots, statusColors, statusLabels } from "@/lib/hotspots";

interface Props {
  hotspot: Hotspot | null;
  onClose: () => void;
  onNavigate: (h: Hotspot) => void;
}

export default function WorkshopPanel({ hotspot, onClose, onNavigate }: Props) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (!hotspot) return;
      const idx = hotspots.findIndex(h => h.id === hotspot.id);
      if (e.key === "ArrowRight") onNavigate(hotspots[(idx + 1) % hotspots.length]);
      if (e.key === "ArrowLeft")  onNavigate(hotspots[(idx - 1 + hotspots.length) % hotspots.length]);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [hotspot, onClose, onNavigate]);

  if (!hotspot) return null;

  const { panelContent: p, color } = hotspot;
  const idx  = hotspots.findIndex(h => h.id === hotspot.id);
  const prev = hotspots[(idx - 1 + hotspots.length) % hotspots.length];
  const next = hotspots[(idx + 1) % hotspots.length];

  const BORDER = "#dce5d6";
  const TEXT   = "#1a2e1f";
  const MUTED  = "#5a7060";
  const DIM    = "#9aaa94";
  const BG     = "#f6f8f3";

  // Split body on \n\n for paragraphs
  const paragraphs = p.body.split("\n\n");

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(15,25,15,0.35)",
          backdropFilter: "blur(3px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "720px",
            maxHeight: "88vh",
            background: "#ffffff",
            border: `1px solid ${BORDER}`,
            boxShadow: "0 24px 80px rgba(15,25,15,0.18), 0 4px 16px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            fontFamily: "var(--font-mono)",
            pointerEvents: "all",
            animation: "panelIn 0.28s cubic-bezier(0.16,1,0.3,1) forwards",
            position: "relative",
          }}
        >
          <style>{`
            @keyframes panelIn {
              from { opacity:0; transform: scale(0.96) translateY(8px); }
              to   { opacity:1; transform: scale(1) translateY(0); }
            }
            @keyframes ledpulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
          `}</style>

          {/* Corner brackets */}
          {[
            { top:-1, left:-1, borderWidth:"2px 0 0 2px" },
            { top:-1, right:-1, borderWidth:"2px 2px 0 0" },
            { bottom:-1, left:-1, borderWidth:"0 0 2px 2px" },
            { bottom:-1, right:-1, borderWidth:"0 2px 2px 0" },
          ].map((s, i) => (
            <div key={i} style={{
              position:"absolute", width:16, height:16,
              borderStyle:"solid", borderColor: color,
              ...s,
            }}/>
          ))}

          {/* Color accent bar */}
          <div style={{ height:"3px", background:`linear-gradient(90deg, ${color}, ${color}44)`, flexShrink:0 }}/>

          {/* Header row */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"16px 24px",
            borderBottom:`1px solid ${BORDER}`,
            flexShrink:0,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <div style={{
                width:7, height:7, borderRadius:"50%",
                background: color,
                boxShadow:`0 0 8px ${color}88`,
                animation:"ledpulse 2.4s ease-in-out infinite",
              }}/>
              <span style={{ fontSize:"9px", letterSpacing:"0.18em", textTransform:"uppercase", color: MUTED }}>
                {hotspot.sublabel}
              </span>
              <span style={{ fontSize:"9px", color: DIM, letterSpacing:"0.1em" }}>
                {idx + 1} / {hotspots.length}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background:"none",
                border:`1px solid ${BORDER}`,
                cursor:"pointer",
                width:28, height:28,
                display:"flex", alignItems:"center", justifyContent:"center",
                color: MUTED, fontSize:"14px",
                transition:"all 0.15s",
                fontFamily:"var(--font-mono)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.color = color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = BORDER;
                e.currentTarget.style.color = MUTED;
              }}
            >
              ×
            </button>
          </div>

          {/* Body — scrollable */}
          <div style={{ flex:1, overflowY:"auto", padding:"28px 24px", display:"flex", flexDirection:"column", gap:"20px" }}>

            {/* Title */}
            <div>
              <h2 style={{
                fontSize:"clamp(22px,3vw,30px)", fontWeight:600,
                letterSpacing:"-0.025em", color: TEXT, lineHeight:1.15,
              }}>
                {p.title}
              </h2>
              <div style={{ width:32, height:2, background: color, marginTop:10, opacity:0.9 }}/>
            </div>

            {/* Status + tags */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              <span style={{
                fontSize:"9px", letterSpacing:"0.12em", textTransform:"uppercase",
                padding:"3px 9px",
                background:`${statusColors[p.status]}14`,
                border:`1px solid ${statusColors[p.status]}50`,
                color: statusColors[p.status], borderRadius:"2px",
              }}>
                ● {statusLabels[p.status]}
              </span>
              {p.tags.map(t => (
                <span key={t} style={{
                  fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase",
                  padding:"3px 9px",
                  border:`1px solid ${BORDER}`,
                  color: MUTED, borderRadius:"2px",
                }}>{t}</span>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height:"1px", background: BORDER }}/>

            {/* Body paragraphs */}
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {paragraphs.map((para, i) => (
                <p key={i} style={{ fontSize:"13px", color: MUTED, lineHeight:1.9 }}>
                  {para}
                </p>
              ))}
            </div>

            {/* Live data indicator */}
            {p.liveData && (
              <div style={{
                padding:"14px 16px",
                background: BG,
                border:`1px solid ${color}28`,
                borderLeft:`3px solid ${color}`,
              }}>
                <div style={{ fontSize:"9px", letterSpacing:"0.18em", textTransform:"uppercase", color, marginBottom:"6px" }}>
                  Live Data
                </div>
                <p style={{ fontSize:"11px", color: DIM, lineHeight:1.7 }}>
                  GitHub sync and system status coming soon.
                </p>
              </div>
            )}

            {/* Links */}
            {p.links && p.links.length > 0 && (
              <div>
                <div style={{ fontSize:"8px", letterSpacing:"0.2em", textTransform:"uppercase", color: DIM, marginBottom:"12px" }}>
                  Links
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  {p.links.map(l => (
                    <a
                      key={l.url}
                      href={l.url}
                      target={l.url.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      style={{
                        fontSize:"12px", color:"#2d5a3d",
                        textDecoration:"none",
                        display:"flex", alignItems:"center", gap:"10px",
                        padding:"10px 14px",
                        border:`1px solid ${BORDER}`,
                        transition:"all 0.15s",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = color;
                        (e.currentTarget as HTMLAnchorElement).style.color = color;
                        (e.currentTarget as HTMLAnchorElement).style.background = `${color}08`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = BORDER;
                        (e.currentTarget as HTMLAnchorElement).style.color = "#2d5a3d";
                        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      }}
                    >
                      <span style={{ opacity:0.4, fontSize:"10px" }}>→</span>
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation footer */}
          <div style={{
            padding:"12px 24px",
            borderTop:`1px solid ${BORDER}`,
            display:"flex", alignItems:"center", justifyContent:"space-between",
            background: BG,
            flexShrink:0,
          }}>
            <button
              onClick={() => onNavigate(prev)}
              style={{
                background:"none", border:"none", cursor:"pointer",
                display:"flex", alignItems:"center", gap:"8px",
                fontSize:"9px", letterSpacing:"0.12em", textTransform:"uppercase",
                color: MUTED, fontFamily:"var(--font-mono)",
                transition:"color 0.15s",
                padding:"4px 0",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#1a2e1f")}
              onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
            >
              ← {prev.label}
            </button>

            <span style={{ fontSize:"9px", color: DIM, letterSpacing:"0.12em", textTransform:"uppercase" }}>
              esc to close
            </span>

            <button
              onClick={() => onNavigate(next)}
              style={{
                background:"none", border:"none", cursor:"pointer",
                display:"flex", alignItems:"center", gap:"8px",
                fontSize:"9px", letterSpacing:"0.12em", textTransform:"uppercase",
                color: MUTED, fontFamily:"var(--font-mono)",
                transition:"color 0.15s",
                padding:"4px 0",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#1a2e1f")}
              onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
            >
              {next.label} →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
