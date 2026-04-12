"use client";
import { useState, useRef, useCallback } from "react";
import { hotspots, type Hotspot } from "@/lib/hotspots";

interface Props {
  onSelect: (hotspot: Hotspot | null) => void;
  activeId: string | null;
  onHoverChange?: (hotspot: Hotspot | null) => void;
}

const IMG_W = 2180;
const IMG_H = 1952;

export default function WorkshopScene({ onSelect, activeId, onHoverChange }: Props) {
  const [hoverId, setHoverId]   = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef            = useRef<HTMLDivElement>(null);

  const setHover = useCallback((id: string | null) => {
    setHoverId(id);
    const spot = id ? hotspots.find(h => h.id === id) ?? null : null;
    onHoverChange?.(spot);
  }, [onHoverChange]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const hoveredSpot = hotspots.find(h => h.id === hoverId);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{ position:"relative", width:"100%", maxWidth:`${IMG_W}px`, margin:"0 auto", userSelect:"none" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/workshop.jpg"
        alt="Alex Hofmann's Workshop — isometric view"
        style={{ width:"100%", height:"auto", display:"block" }}
        draggable={false}
      />

      {/* Hotspot overlay */}
      <svg
        viewBox={`0 0 ${IMG_W} ${IMG_H}`}
        style={{ position:"absolute", inset:0, width:"100%", height:"100%",
          cursor: hoverId ? "none" : "default" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {hotspots.map(h => (
            <filter key={h.id} id={`glow-${h.id}`} x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="5" result="blur"/>
              <feFlood floodColor={h.color} floodOpacity="0.5" result="col"/>
              <feComposite in="col" in2="blur" operator="in" result="glow"/>
              <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          ))}
          <clipPath id="scene-clip">
            <rect x="0" y="0" width={IMG_W} height={IMG_H}/>
          </clipPath>
        </defs>

        <g clipPath="url(#scene-clip)">
          {hotspots.map(h => {
            const isHover  = hoverId === h.id;
            const isActive = activeId === h.id;
            const isOn     = isHover || isActive;

            const pts = h.points.trim().split(/\s+/).map(p => {
              const [x, y] = p.split(",").map(Number);
              return { x, y };
            });
            const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
            const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
            const corners = [pts[0], pts[pts.length - 1], pts[1], pts[2]];
            const dirs    = [[1,1],[-1,1],[1,-1],[-1,-1]] as const;

            return (
              <g key={h.id}>
                <polygon
                  points={h.points}
                  fill={isOn ? h.color : "transparent"}
                  fillOpacity={isOn ? (isActive ? 0.16 : 0.1) : 0}
                  stroke={isOn ? h.color : "transparent"}
                  strokeWidth={isActive ? 2 : 1.5}
                  strokeOpacity={isOn ? 0.75 : 0}
                  filter={isOn ? `url(#glow-${h.id})` : undefined}
                  style={{ cursor:"none", transition:"fill-opacity 0.15s, stroke-opacity 0.15s" }}
                  onMouseEnter={() => setHover(h.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onSelect(isActive ? null : h)}
                />

                {/* Corner brackets */}
                {isOn && corners.map((pt, i) => (
                  <g key={i}>
                    <line x1={pt.x} y1={pt.y} x2={pt.x + dirs[i][0] * 13} y2={pt.y}
                      stroke={h.color} strokeWidth="2" opacity="0.9"/>
                    <line x1={pt.x} y1={pt.y} x2={pt.x} y2={pt.y + dirs[i][1] * 13}
                      stroke={h.color} strokeWidth="2" opacity="0.9"/>
                  </g>
                ))}

                {/* Zone label — white card */}
                {isOn && (
                  <g>
                    <rect
                      x={cx - 68} y={cy - 15}
                      width={136} height={24}
                      rx="1"
                      fill="#ffffff" fillOpacity="0.96"
                      stroke={h.color} strokeWidth="1.2" strokeOpacity="0.9"
                    />
                    <text
                      x={cx} y={cy + 1}
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="'JetBrains Mono', monospace"
                      fontWeight="600"
                      letterSpacing="2"
                      fill={h.color}
                    >
                      {h.label.toUpperCase()}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip near cursor */}
      {hoveredSpot && !activeId && (
        <div
          style={{
            position:"absolute",
            left: mousePos.x + 18,
            top:  mousePos.y - 10,
            background:"#ffffff",
            border:`1px solid ${hoveredSpot.color}`,
            borderLeft:`3px solid ${hoveredSpot.color}`,
            padding:"7px 13px",
            pointerEvents:"none",
            boxShadow:"0 4px 20px rgba(0,0,0,0.1)",
            zIndex:10,
            whiteSpace:"nowrap",
          }}
        >
          <div style={{
            fontSize:"10px", fontWeight:600, color: hoveredSpot.color,
            letterSpacing:"0.14em", textTransform:"uppercase",
            fontFamily:"'JetBrains Mono', monospace",
          }}>
            {hoveredSpot.label}
          </div>
          <div style={{
            fontSize:"9px", color:"#5a7060",
            letterSpacing:"0.06em", marginTop:"2px",
            fontFamily:"'JetBrains Mono', monospace",
          }}>
            {hoveredSpot.sublabel}
          </div>
        </div>
      )}
    </div>
  );
}
