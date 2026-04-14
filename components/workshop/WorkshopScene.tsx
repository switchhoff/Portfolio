"use client";
import { useState, useRef, useCallback } from "react";
import { getMappedHotspots, getCategoryColor, type Hotspot } from "@/lib/hotspots-config";

interface Props {
  onHotspotClick: (hotspot: Hotspot, clickOrigin: { x: number; y: number }) => void;
  activeId: string | null;
  highlightCategory: string | null;
  onHoverChange?: (hotspot: Hotspot | null) => void;
}

const IMG_W = 2180;
const IMG_H = 1952;

export default function WorkshopScene({ onHotspotClick, activeId, highlightCategory, onHoverChange }: Props) {
  const [hoverId, setHoverId]   = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef            = useRef<HTMLDivElement>(null);

  const hotspots = getMappedHotspots();

  const setHover = useCallback((id: string | null) => {
    setHoverId(id);
    const spot = id ? hotspots.find(h => h.id === id) ?? null : null;
    onHoverChange?.(spot);
  }, [onHoverChange, hotspots]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const hoveredSpot = hotspots.find(h => h.id === hoverId);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{ position: "relative", width: "100%", maxWidth: `${IMG_W}px`, margin: "0 auto", userSelect: "none" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/Room.svg"
        alt="Room"
        style={{ width: "100%", height: "auto", display: "block" }}
        draggable={false}
      />

      {/* Hotspot overlay */}
      {hotspots.length > 0 && (
        <svg
          viewBox={`0 0 ${IMG_W} ${IMG_H}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
            cursor: hoverId ? "none" : "default" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {hotspots.map(h => {
              const catColor = getCategoryColor(h.category);
              return (
                <filter key={h.id} id={`glow-${h.id}`} x="-25%" y="-25%" width="150%" height="150%">
                  <feGaussianBlur stdDeviation="5" result="blur"/>
                  <feFlood floodColor={catColor} floodOpacity="0.5" result="col"/>
                  <feComposite in="col" in2="blur" operator="in" result="glow"/>
                  <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              );
            })}
            <clipPath id="scene-clip">
              <rect x="0" y="0" width={IMG_W} height={IMG_H}/>
            </clipPath>
          </defs>

          <g clipPath="url(#scene-clip)">
            {hotspots.map(h => {
              const catColor   = getCategoryColor(h.category);
              const isHover    = hoverId === h.id;
              const isActive   = activeId === h.id;
              const isHighlit  = highlightCategory === h.category;
              const isOn       = isHover || isActive || isHighlit;

              const pts = h.points.trim().split(/\s+/).map(p => {
                const [x, y] = p.split(",").map(Number);
                return { x, y };
              });
              if (pts.length < 3) return null;

              const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
              const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
              const corners = [pts[0], pts[pts.length - 1], pts[1], pts[Math.min(2, pts.length - 1)]];
              const dirs    = [[1,1],[-1,1],[1,-1],[-1,-1]] as const;

              return (
                <g key={h.id}>
                  <polygon
                    points={h.points}
                    fill={isOn ? catColor : "transparent"}
                    fillOpacity={isOn ? (isActive ? 0.16 : isHighlit ? 0.08 : 0.1) : 0}
                    stroke={isOn ? catColor : "transparent"}
                    strokeWidth={isActive ? 2 : 1.5}
                    strokeOpacity={isOn ? 0.75 : 0}
                    filter={isHover || isActive ? `url(#glow-${h.id})` : undefined}
                    style={{
                      cursor: "none",
                      transition: "fill-opacity 0.15s, stroke-opacity 0.15s",
                      animation: isHighlit && !isHover && !isActive ? "pulse 2s ease-in-out infinite" : undefined,
                    }}
                    onPointerEnter={() => setHover(h.id)}
                    onPointerLeave={() => setHover(null)}
                    onClick={(e) => {
                      const rect = containerRef.current?.getBoundingClientRect();
                      if (rect) {
                        const scale = rect.width / IMG_W;
                        onHotspotClick(h, { x: cx * scale, y: cy * scale });
                      } else {
                        onHotspotClick(h, { x: e.clientX, y: e.clientY });
                      }
                    }}
                  />

                  {/* Corner brackets */}
                  {(isHover || isActive) && corners.map((pt, i) => (
                    <g key={i}>
                      <line x1={pt.x} y1={pt.y} x2={pt.x + dirs[i][0] * 13} y2={pt.y}
                        stroke={catColor} strokeWidth="2" opacity="0.9"/>
                      <line x1={pt.x} y1={pt.y} x2={pt.x} y2={pt.y + dirs[i][1] * 13}
                        stroke={catColor} strokeWidth="2" opacity="0.9"/>
                    </g>
                  ))}

                  {/* Zone label card */}
                  {(isHover || isActive) && (
                    <g>
                      <rect
                        x={cx - 68} y={cy - 15}
                        width={136} height={24}
                        rx="1"
                        fill="#ffffff" fillOpacity="0.96"
                        stroke={catColor} strokeWidth="1.2" strokeOpacity="0.9"
                      />
                      <text
                        x={cx} y={cy + 1}
                        textAnchor="middle"
                        fontSize="9"
                        fontFamily="'JetBrains Mono', monospace"
                        fontWeight="600"
                        letterSpacing="2"
                        fill={catColor}
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
      )}

      {/* Tooltip near cursor */}
      {hoveredSpot && !activeId && (
        <div
          style={{
            position: "absolute",
            left: mousePos.x + 18,
            top:  mousePos.y - 10,
            background: "#ffffff",
            border: `1px solid ${getCategoryColor(hoveredSpot.category)}`,
            borderLeft: `3px solid ${getCategoryColor(hoveredSpot.category)}`,
            padding: "7px 13px",
            pointerEvents: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            zIndex: 10,
            whiteSpace: "nowrap",
          }}
        >
          <div style={{
            fontSize: "10px", fontWeight: 600, color: getCategoryColor(hoveredSpot.category),
            letterSpacing: "0.14em", textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {hoveredSpot.label}
          </div>
          <div style={{
            fontSize: "9px", color: "#5a7060",
            letterSpacing: "0.06em", marginTop: "2px",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {hoveredSpot.category}
          </div>
        </div>
      )}
    </div>
  );
}
