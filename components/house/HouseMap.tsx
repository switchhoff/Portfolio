"use client";
import { useState } from "react";
import { projects, type Project } from "@/lib/projects";

interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  projectId: string;
}

const hotspots: Hotspot[] = [
  { id: "garage",   label: "Garage",        x: 30,  y: 280, width: 120, height: 90,  projectId: "bintherestore" },
  { id: "living",   label: "Living Room",   x: 170, y: 200, width: 110, height: 120, projectId: "habitat"       },
  { id: "desk",     label: "Desk",          x: 295, y: 180, width: 90,  height: 80,  projectId: "hoffswitch"    },
  { id: "workshop", label: "Workshop",      x: 295, y: 270, width: 90,  height: 100, projectId: "infraredlaser" },
  { id: "content",  label: "Content",       x: 170, y: 330, width: 110, height: 70,  projectId: "vibecode"      },
];

const colorMap = {
  cyan:   { fill: "rgba(0,212,255,0.06)",   stroke: "rgba(0,212,255,0.5)",   text: "#00d4ff" },
  green:  { fill: "rgba(0,255,136,0.06)",   stroke: "rgba(0,255,136,0.5)",   text: "#00ff88" },
  copper: { fill: "rgba(200,121,65,0.06)",  stroke: "rgba(200,121,65,0.5)",  text: "#c87941" },
  orange: { fill: "rgba(255,107,53,0.06)",  stroke: "rgba(255,107,53,0.5)",  text: "#ff6b35" },
};

interface Props {
  onSelect: (project: Project) => void;
  activeId: string | null;
}

export default function HouseMap({ onSelect, activeId }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const getProject = (id: string) => projects.find(p => p.id === id)!;

  return (
    <div className="relative w-full max-w-[500px] mx-auto select-none">
      {/* TODO: Replace with vectorised house image from Google Maps */}
      <svg
        viewBox="0 0 500 420"
        className="w-full h-auto"
        style={{ filter: "drop-shadow(0 0 40px rgba(0,212,255,0.04))" }}
      >
        {/* ── House Structure ── */}
        {/* Roof */}
        <polygon
          points="160,80 250,20 390,80"
          fill="#0a1520"
          stroke="#243850"
          strokeWidth="1.5"
        />
        {/* Roof ridge line */}
        <line x1="250" y1="20" x2="250" y2="80" stroke="#243850" strokeWidth="0.5" strokeDasharray="4,4" />

        {/* Main house body */}
        <rect x="160" y="80" width="230" height="300" fill="#0a1520" stroke="#243850" strokeWidth="1.5" />

        {/* Garage extension */}
        <rect x="30" y="200" width="130" height="180" fill="#081018" stroke="#1e2d3d" strokeWidth="1.5" />
        {/* Garage roof */}
        <polygon points="20,200 95,155 175,200" fill="#081018" stroke="#1e2d3d" strokeWidth="1.5" />

        {/* ── Windows ── */}
        {/* Left upper window */}
        <rect x="185" y="105" width="45" height="40" fill="#0d1e2e" stroke="#243850" strokeWidth="1" />
        <line x1="207" y1="105" x2="207" y2="145" stroke="#1e3040" strokeWidth="0.5" />
        <line x1="185" y1="125" x2="230" y2="125" stroke="#1e3040" strokeWidth="0.5" />

        {/* Right upper window */}
        <rect x="310" y="105" width="45" height="40" fill="#0d1e2e" stroke="#243850" strokeWidth="1" />
        <line x1="332" y1="105" x2="332" y2="145" stroke="#1e3040" strokeWidth="0.5" />
        <line x1="310" y1="125" x2="355" y2="125" stroke="#1e3040" strokeWidth="0.5" />

        {/* Garage window */}
        <rect x="50" y="215" width="90" height="55" fill="#0a1820" stroke="#1e2d3d" strokeWidth="1" />
        <line x1="95" y1="215" x2="95" y2="270" stroke="#162028" strokeWidth="0.5" />
        <line x1="50" y1="242" x2="140" y2="242" stroke="#162028" strokeWidth="0.5" />

        {/* ── Door ── */}
        <rect x="228" y="310" width="44" height="70" fill="#0a1520" stroke="#243850" strokeWidth="1" rx="1" />
        <circle cx="265" cy="348" r="2.5" fill="#243850" />

        {/* ── Ground line ── */}
        <line x1="10" y1="380" x2="490" y2="380" stroke="#162030" strokeWidth="1" />

        {/* ── Driveway ── */}
        <path d="M30 380 L30 420 L160 420 L160 380" fill="none" stroke="#162030" strokeWidth="0.5" strokeDasharray="6,3" />

        {/* ── Detail: Antenna on roof ── */}
        <line x1="340" y1="80" x2="340" y2="48" stroke="#243850" strokeWidth="1" />
        <line x1="330" y1="52" x2="350" y2="52" stroke="#243850" strokeWidth="1" />
        <line x1="326" y1="56" x2="354" y2="56" stroke="#1e2d3d" strokeWidth="0.5" />
        {/* Antenna LED — blinks when agent running */}
        <circle cx="340" cy="47" r="2.5" fill="#00d4ff" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* ── PCB trace decorations ── */}
        <path d="M160 200 L140 200 L140 230 L155 230" fill="none" stroke="#162030" strokeWidth="0.5" />
        <circle cx="140" cy="200" r="2" fill="none" stroke="#162030" strokeWidth="0.5" />
        <path d="M390 200 L410 200 L410 240 L430 240" fill="none" stroke="#162030" strokeWidth="0.5" />
        <circle cx="430" cy="240" r="2" fill="none" stroke="#162030" strokeWidth="0.5" />

        {/* ── Hotspot zones ── */}
        {hotspots.map((hs) => {
          const proj = getProject(hs.projectId);
          const c = colorMap[proj.color];
          const isHover = hoverId === hs.id;
          const isActive = activeId === hs.projectId;

          return (
            <g key={hs.id}>
              <rect
                x={hs.x}
                y={hs.y}
                width={hs.width}
                height={hs.height}
                fill={isHover || isActive ? c.fill : "transparent"}
                stroke={isHover || isActive ? c.stroke : "transparent"}
                strokeWidth="1"
                rx="2"
                style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                onMouseEnter={() => setHoverId(hs.id)}
                onMouseLeave={() => setHoverId(null)}
                onClick={() => onSelect(proj)}
              />
              {/* Zone label */}
              {(isHover || isActive) && (
                <text
                  x={hs.x + hs.width / 2}
                  y={hs.y - 6}
                  textAnchor="middle"
                  fontSize="8"
                  letterSpacing="0.1em"
                  fill={c.text}
                  style={{ textTransform: "uppercase", pointerEvents: "none" }}
                >
                  {hs.label}
                </text>
              )}
              {/* Corner markers on hover */}
              {isHover && (
                <>
                  <line x1={hs.x} y1={hs.y} x2={hs.x + 8} y2={hs.y} stroke={c.stroke} strokeWidth="1" />
                  <line x1={hs.x} y1={hs.y} x2={hs.x} y2={hs.y + 8} stroke={c.stroke} strokeWidth="1" />
                  <line x1={hs.x + hs.width - 8} y1={hs.y} x2={hs.x + hs.width} y2={hs.y} stroke={c.stroke} strokeWidth="1" />
                  <line x1={hs.x + hs.width} y1={hs.y} x2={hs.x + hs.width} y2={hs.y + 8} stroke={c.stroke} strokeWidth="1" />
                  <line x1={hs.x} y1={hs.y + hs.height - 8} x2={hs.x} y2={hs.y + hs.height} stroke={c.stroke} strokeWidth="1" />
                  <line x1={hs.x} y1={hs.y + hs.height} x2={hs.x + 8} y2={hs.y + hs.height} stroke={c.stroke} strokeWidth="1" />
                  <line x1={hs.x + hs.width} y1={hs.y + hs.height - 8} x2={hs.x + hs.width} y2={hs.y + hs.height} stroke={c.stroke} strokeWidth="1" />
                  <line x1={hs.x + hs.width - 8} y1={hs.y + hs.height} x2={hs.x + hs.width} y2={hs.y + hs.height} stroke={c.stroke} strokeWidth="1" />
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoverId && (
        <div
          className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 readout"
          style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}
        >
          Click to explore →
        </div>
      )}
    </div>
  );
}
