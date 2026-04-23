"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { getMappedHotspots, getCategoryColor, type Hotspot } from "@/lib/hotspots-config";
import { BLOCK_MAPPINGS, CATEGORY_COLORS } from "@/lib/svgBlockMappings";
import { getPathData } from "@/lib/pathData";
import { WeatherWindow } from "./WeatherWindow";
import AmbientPlayer from "./AmbientPlayer";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface Props {
  onHotspotClick: (hotspot: Hotspot, clickOrigin: { x: number; y: number }) => void;
  activeId: string | null;
  highlightCategory: string | null;
  onHoverChange?: (hotspot: Hotspot | null) => void;
}

const IMG_W = 2180;
const IMG_H = 1952;

// Path groupings - multiple paths treated as single entity
const PATH_GROUPS = new Map<number, number>([
  [96, 96], [98, 96],  // Paths 96 and 98 → group 96
  [78, 78], [80, 78],  // Paths 78 and 80 → group 78
]);

// Reverse map: group ID → all paths in group
const GROUP_PATHS = new Map<number, number[]>([
  [96, [96, 98]],
  [78, [78, 80]],
]);

export default function WorkshopScene({ onHotspotClick, activeId, highlightCategory, onHoverChange }: Props) {
  const [hoverId, setHoverId]   = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [blockPaths, setBlockPaths] = useState<SVGPathElement[]>([]);
  const [clickedPath, setClickedPath] = useState<{ index: number; x: number; y: number } | null>(null);
  const [cheatMode, setCheatMode] = useState(false);
  const [visitedPaths, setVisitedPaths] = useState<Set<number>>(new Set());
  const visitedPathsRef = useRef<Set<number>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [golfForm, setGolfForm] = useState<{ name: string; number: string } | null>(null);
  const [golfSending, setGolfSending] = useState(false);
  const [golfSent, setGolfSent] = useState(false);
  const [golfError, setGolfError] = useState("");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const FILTER_ORDER = ["about", "interests", "projects", "education", "experience"];
  const FILTER_GROUPS: Record<string, number[]> = Object.fromEntries(
    FILTER_ORDER
      .filter(k => BLOCK_MAPPINGS[k as keyof typeof BLOCK_MAPPINGS])
      .map(category => [
        category,
        BLOCK_MAPPINGS[category as keyof typeof BLOCK_MAPPINGS].flatMap(b => [b.fillPath, b.strokePath]),
      ])
  );
  const filterPaths: Set<number> | null = activeFilters.size === 0 ? null : new Set(
    [...activeFilters].flatMap(cat => FILTER_GROUPS[cat] ?? [])
  );
  const containerRef            = useRef<HTMLDivElement>(null);
  const blockSvgRef            = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const loadBlockSVG = async () => {
      try {
        const res = await fetch("/OffswitchBlocks.svg");
        const svgText = await res.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");

        if (blockSvgRef.current) {
          // Clear any existing content
          blockSvgRef.current.innerHTML = '';

          const pathElements = Array.from(
            svgDoc.querySelectorAll("path")
          ) as SVGPathElement[];

          const imageElements = Array.from(
            svgDoc.querySelectorAll("image")
          ) as SVGImageElement[];
          imageElements.forEach((img) => img.remove());

          pathElements.forEach((path) => {
            const clonedPath = path.cloneNode(true) as SVGPathElement;
            blockSvgRef.current?.appendChild(clonedPath);
          });

          const visiblePaths = Array.from(
            blockSvgRef.current.querySelectorAll("path")
          ) as SVGPathElement[];

          // Hide background/white/black fill paths (first 2)
          visiblePaths.forEach((path, idx) => {
            if (idx < 2) {
              path.style.visibility = "hidden";
              path.style.pointerEvents = "none";
            }
          });

          setBlockPaths(visiblePaths);

          // Color paths by category and add click handlers
          Object.entries(BLOCK_MAPPINGS).forEach(([category, blockList]) => {
            const color = CATEGORY_COLORS[category];
            blockList.forEach((block) => {
              const fillPath = visiblePaths[block.fillPath];
              const strokePath = visiblePaths[block.strokePath];

              if (fillPath) {
                // Invisible fill for clickability, no stroke
                fillPath.setAttribute("fill", color);
                fillPath.setAttribute("fill-opacity", "0.01");
                fillPath.setAttribute("stroke", "none");
                fillPath.setAttribute("data-color", color);
                fillPath.setAttribute("pointer-events", "auto");
                fillPath.setAttribute("cursor", "pointer");

                fillPath.addEventListener("click", (e) => {
                  const evt = e as MouseEvent;
                  const groupedIndex = PATH_GROUPS.get(block.fillPath) ?? block.fillPath;
                  const pathsInGroup = GROUP_PATHS.get(groupedIndex) ?? [groupedIndex];

                  // Remove strokes from all paths
                  const allPaths = blockSvgRef.current?.querySelectorAll("path") ?? [];
                  allPaths.forEach((p, idx) => {
                    (p as SVGPathElement).setAttribute("stroke", "none");
                    (p as SVGPathElement).setAttribute("fill-opacity", "0.01");
                  });

                  // Highlight all paths in group
                  allPaths.forEach((p, idx) => {
                    if (pathsInGroup.includes(idx)) {
                      (p as SVGPathElement).setAttribute("stroke", color);
                      (p as SVGPathElement).setAttribute("stroke-width", "2");
                      (p as SVGPathElement).setAttribute("fill-opacity", "0.2");
                    }
                  });

                  // Re-apply visited grey — expand group roots to all member paths
                  visitedPathsRef.current.forEach(visitedIdx => {
                    const memberPaths = GROUP_PATHS.get(visitedIdx) ?? [visitedIdx];
                    memberPaths.forEach(gIdx => {
                      if (!pathsInGroup.includes(gIdx)) {
                        const vp = allPaths[gIdx] as SVGPathElement | undefined;
                        if (vp && vp.getAttribute("fill") && vp.getAttribute("fill") !== "none") {
                          vp.setAttribute("fill", "#999999");
                          vp.setAttribute("fill-opacity", "0.5");
                        }
                      }
                    });
                  });

                  setClickedPath({
                    index: groupedIndex,
                    x: evt.clientX,
                    y: evt.clientY,
                  });
                });
              }
              if (strokePath) {
                // No fill, no stroke - invisible but clickable
                strokePath.setAttribute("fill", "none");
                strokePath.setAttribute("stroke", "none");
                strokePath.setAttribute("data-color", color);
                strokePath.setAttribute("pointer-events", "auto");
                strokePath.setAttribute("cursor", "pointer");

                strokePath.addEventListener("click", (e) => {
                  const evt = e as MouseEvent;
                  const groupedIndex = PATH_GROUPS.get(block.strokePath) ?? block.strokePath;
                  const pathsInGroup = GROUP_PATHS.get(groupedIndex) ?? [groupedIndex];

                  // Remove strokes from all paths
                  const allPaths = blockSvgRef.current?.querySelectorAll("path") ?? [];
                  allPaths.forEach((p, idx) => {
                    (p as SVGPathElement).setAttribute("stroke", "none");
                    (p as SVGPathElement).setAttribute("fill-opacity", "0.01");
                  });

                  // Highlight all paths in group
                  allPaths.forEach((p, idx) => {
                    if (pathsInGroup.includes(idx)) {
                      (p as SVGPathElement).setAttribute("stroke", color);
                      (p as SVGPathElement).setAttribute("stroke-width", "2");
                      (p as SVGPathElement).setAttribute("fill-opacity", "0.2");
                    }
                  });

                  // Re-apply visited grey — expand group roots to all member paths
                  visitedPathsRef.current.forEach(visitedIdx => {
                    const memberPaths = GROUP_PATHS.get(visitedIdx) ?? [visitedIdx];
                    memberPaths.forEach(gIdx => {
                      if (!pathsInGroup.includes(gIdx)) {
                        const vp = allPaths[gIdx] as SVGPathElement | undefined;
                        if (vp && vp.getAttribute("fill") && vp.getAttribute("fill") !== "none") {
                          vp.setAttribute("fill", "#999999");
                          vp.setAttribute("fill-opacity", "0.5");
                        }
                      }
                    });
                  });

                  setClickedPath({
                    index: groupedIndex,
                    x: evt.clientX,
                    y: evt.clientY,
                  });
                });
              }
            });
          });
        }
      } catch (err) {
        console.error("Failed to load block SVG:", err);
      }
    };

    loadBlockSVG();
  }, []);

  // Turning cheat mode on/off has no visual effect on its own —
  // filter group toggles drive highlighting; turning cheats off clears filterPaths (handled in onClick).
  // When cheats turn off, ensure all strokes/fills reset (filter effect handles it via filterPaths null).
  useEffect(() => {
    if (!cheatMode) {
      // Clear any filter highlights — restore to visited-grey-only state
      const allPaths = blockSvgRef.current?.querySelectorAll("path") ?? [];
      allPaths.forEach((p, idx) => {
        const path = p as SVGPathElement;
        let isVisited = visitedPathsRef.current.has(idx);
        if (!isVisited) {
          const groupRoot = PATH_GROUPS.get(idx);
          isVisited = groupRoot !== undefined && visitedPathsRef.current.has(groupRoot);
        }
        if (isVisited) {
          if (path.getAttribute("fill") && path.getAttribute("fill") !== "none") {
            path.setAttribute("fill", "#999999");
            path.setAttribute("fill-opacity", "0.5");
          }
          path.setAttribute("stroke", "none");
        } else {
          path.setAttribute("fill-opacity", "0.01");
          path.setAttribute("stroke", "none");
        }
      });
    }
  }, [cheatMode]);

  // Apply filter highlighting
  useEffect(() => {
    const allPaths = blockSvgRef.current?.querySelectorAll("path") ?? [];
    allPaths.forEach((p, idx) => {
      const path = p as SVGPathElement;

      // Check if path is visited
      let isVisited = visitedPaths.has(idx);
      if (!isVisited) {
        const groupRoot = PATH_GROUPS.get(idx);
        isVisited = groupRoot !== undefined && visitedPaths.has(groupRoot);
      }

      if (filterPaths && filterPaths.has(idx)) {
        // Show outline only — no fill colour change
        const color = path.getAttribute("data-color") || "#45B7D1";
        if (isVisited) {
          // Keep grey fill for visited, add coloured outline
          if (path.getAttribute("fill") && path.getAttribute("fill") !== "none") {
            path.setAttribute("fill", "#999999");
            path.setAttribute("fill-opacity", "0.5");
          }
        } else {
          // Not visited — keep fill invisible
          path.setAttribute("fill-opacity", "0.01");
        }
        path.setAttribute("stroke", color);
        path.setAttribute("stroke-width", "1.5");
      } else if (filterPaths && isVisited) {
        // Visited but not in filtered group — keep grey, no outline
        if (path.getAttribute("fill") && path.getAttribute("fill") !== "none") {
          path.setAttribute("fill", "#999999");
          path.setAttribute("fill-opacity", "0.5");
        }
        path.setAttribute("stroke", "none");
      } else if (filterPaths) {
        // Non-filtered, non-visited — hidden
        path.setAttribute("fill-opacity", "0.01");
        path.setAttribute("stroke", "none");
      } else {
        // No filter active — restore visited grey, clear strokes
        if (isVisited) {
          if (path.getAttribute("fill") && path.getAttribute("fill") !== "none") {
            path.setAttribute("fill", "#999999");
            path.setAttribute("fill-opacity", "0.5");
          }
        } else {
          path.setAttribute("fill-opacity", "0.01");
        }
        path.setAttribute("stroke", "none");
      }
    });
  }, [activeFilters, visitedPaths]);

  // Keep ref in sync so addEventListener callbacks can access current visited set
  useEffect(() => { visitedPathsRef.current = visitedPaths; }, [visitedPaths]);

  // Apply grey fill to visited paths (including grouped pairs)
  useEffect(() => {
    if (activeFilters.size > 0) return; // Skip when filter active

    const allPaths = blockSvgRef.current?.querySelectorAll("path") ?? [];
    allPaths.forEach((p, idx) => {
      // Check if this path or its group root is visited
      let isVisited = visitedPaths.has(idx);
      if (!isVisited) {
        const groupRoot = PATH_GROUPS.get(idx);
        isVisited = groupRoot !== undefined && visitedPaths.has(groupRoot);
      }

      if (isVisited) {
        const path = p as SVGPathElement;
        if (path.getAttribute("fill") && path.getAttribute("fill") !== "none") {
          path.setAttribute("fill", "#999999");
          path.setAttribute("fill-opacity", "0.5");
        }
      }
    });
  }, [visitedPaths, filterPaths]);


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
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}
    >
      {/* Menu Bar */}
      <div style={{
        position: "absolute",
        top: "175px",
        right: "75px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        zIndex: 55,
        background: "rgba(10,15,10,0.82)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,215,0,0.25)",
        borderRadius: "8px",
        overflow: "hidden",
        minWidth: "180px",
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {/* Cheats master toggle row */}
        <div
          onClick={() => {
            setCheatMode(!cheatMode);
            if (cheatMode) setActiveFilters(new Set());
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            cursor: "pointer",
            borderBottom: "1px solid rgba(255,215,0,0.15)",
            userSelect: "none",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "#FFD700" }}>
            CHEATS
          </span>
          {/* Sliding toggle */}
          <div style={{
            width: 32, height: 16,
            background: cheatMode ? "#FFD700" : "rgba(255,255,255,0.1)",
            borderRadius: 8,
            position: "relative",
            transition: "background 0.2s",
            flexShrink: 0,
          }}>
            <div style={{
              position: "absolute",
              top: 2, left: cheatMode ? 18 : 2,
              width: 12, height: 12,
              borderRadius: "50%",
              background: cheatMode ? "#000" : "rgba(255,255,255,0.5)",
              transition: "left 0.2s, background 0.2s",
            }} />
          </div>
        </div>

        {/* Filter toggle rows */}
        {Object.entries(FILTER_GROUPS).map(([name, paths]) => {
          const categoryColor = CATEGORY_COLORS[name] || "#999999";
          const isActive = activeFilters.has(name);
          return (
            <div
              key={name}
              onClick={() => {
                if (!cheatMode) return;
                setActiveFilters(prev => {
                  const next = new Set(prev);
                  isActive ? next.delete(name) : next.add(name);
                  return next;
                });
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 16px",
                cursor: cheatMode ? "pointer" : "not-allowed",
                opacity: cheatMode ? 1 : 0.35,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                userSelect: "none",
                transition: "opacity 0.2s",
              }}
            >
              <span style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: isActive ? categoryColor : "rgba(255,255,255,0.5)",
                transition: "color 0.2s",
              }}>
                {name}
              </span>
              {/* Sliding toggle */}
              <div style={{
                width: 28, height: 14,
                background: isActive ? categoryColor : "rgba(255,255,255,0.1)",
                borderRadius: 7,
                position: "relative",
                transition: "background 0.2s",
                flexShrink: 0,
              }}>
                <div style={{
                  position: "absolute",
                  top: 2, left: isActive ? 16 : 2,
                  width: 10, height: 10,
                  borderRadius: "50%",
                  background: isActive ? "#000" : "rgba(255,255,255,0.5)",
                  transition: "left 0.2s, background 0.2s",
                }} />
              </div>
            </div>
          );
        })}
      </div>
      {/* Ambient player — angled text + play button just above scene */}
      <AmbientPlayer />

      {/* Weather window SVG layer — same coordinate space as blocks */}
      <svg
        viewBox="0 0 960 540"
        style={{
          position: "absolute",
          inset: 0,
          left: "-0.83%",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 12,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <WeatherWindow />
      </svg>

      {/* Blocks overlay SVG - colored transparent overlays on top */}
      <svg
        ref={blockSvgRef}
        viewBox="0 0 960 540"
        style={{
          position: "absolute",
          inset: 0,
          left: "-0.83%",
          width: "100%",
          height: "100%",
          pointerEvents: "auto",
          zIndex: 15,
        }}
        xmlns="http://www.w3.org/2000/svg"
      />

      {/* Hotspot overlay - hidden for now, blocks take precedence */}
      {false && hotspots.length > 0 && (
        <svg
          viewBox={`0 0 ${IMG_W} ${IMG_H}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
            cursor: hoverId ? "none" : "default", zIndex: 5 }}
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

      {/* Golf form modal */}
      {golfForm !== null && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.3)" }}
            onClick={() => setGolfForm(null)} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            background: "#fff", border: "2px solid #27ae60", borderRadius: "8px",
            padding: "20px 24px", zIndex: 61, width: "300px",
            fontFamily: "'JetBrains Mono', monospace",
          }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#27ae60", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>Golf</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "14px" }}>Connect for a Round</div>
            {golfSent ? (
              <div style={{ textAlign: "center", padding: "16px 0", color: "#27ae60", fontSize: "13px", fontWeight: 600 }}>
                ⛳ Request sent! I'll be in touch.
                <br /><button onClick={() => setGolfForm(null)} style={{ marginTop: "12px", background: "none", border: "1px solid #27ae60", color: "#27ae60", padding: "6px 14px", cursor: "pointer", fontFamily: "inherit", fontSize: "11px" }}>Close</button>
              </div>
            ) : (
              <form onSubmit={async e => {
                e.preventDefault();
                setGolfSending(true);
                setGolfError("");
                try {
                  await addDoc(collection(db, "golf_requests"), {
                    name: golfForm.name,
                    number: golfForm.number,
                    createdAt: serverTimestamp(),
                  });
                  setGolfSent(true);
                } catch {
                  setGolfError("Failed to send. Try emailing me directly.");
                } finally {
                  setGolfSending(false);
                }
              }}>
                <div style={{ marginBottom: "10px" }}>
                  <label style={{ fontSize: "10px", fontWeight: 700, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Name</label>
                  <input required value={golfForm.name} onChange={e => setGolfForm(f => f && ({ ...f, name: e.target.value }))}
                    placeholder="Your name" style={{ width: "100%", border: "1px solid #ddd", padding: "7px 10px", fontSize: "13px", fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ fontSize: "10px", fontWeight: 700, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Phone Number</label>
                  <input required value={golfForm.number} onChange={e => setGolfForm(f => f && ({ ...f, number: e.target.value }))}
                    placeholder="Your number" type="tel" style={{ width: "100%", border: "1px solid #ddd", padding: "7px 10px", fontSize: "13px", fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />
                </div>
                {golfError && <div style={{ color: "#e74c3c", fontSize: "11px", marginBottom: "10px" }}>{golfError}</div>}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" onClick={() => setGolfForm(null)} style={{ flex: 1, padding: "8px", background: "none", border: "1px solid #ddd", cursor: "pointer", fontFamily: "inherit", fontSize: "12px" }}>Cancel</button>
                  <button type="submit" disabled={golfSending} style={{ flex: 1, padding: "8px", background: "#27ae60", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: "12px", fontWeight: 700 }}>
                    {golfSending ? "Sending..." : "Send ⛳"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
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
            fontSize: "13px", fontWeight: 600, color: getCategoryColor(hoveredSpot.category),
            letterSpacing: "0.14em", textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {hoveredSpot.label}
          </div>
          <div style={{
            fontSize: "11px", color: "#000",
            letterSpacing: "0.06em", marginTop: "2px",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {hoveredSpot.category}
          </div>
        </div>
      )}

      {/* SVG Element Popup Card */}
      {clickedPath && (() => {
        const pathData = getPathData(clickedPath.index);
        const categoryColor = pathData ? CATEGORY_COLORS[pathData.category] : "#999999";
        return (
          <>
            {/* Click outside to close */}
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 56,
              }}
              onClick={() => {
                const allPaths = blockSvgRef.current?.querySelectorAll("path") ?? [];
                allPaths.forEach((p) => (p as SVGPathElement).setAttribute("stroke", "none"));
                if (clickedPath) {
                  setVisitedPaths(prev => new Set([...prev, clickedPath.index]));
                }
                setClickedPath(null);
              }}
            />

            {/* Popup Card */}
            <div
              style={{
                position: "fixed",
                left: clickedPath.x - (pathData?.category === "generic" || !pathData?.description ? 80 : 140),
                top: clickedPath.y - 120,
                background: "#ffffff",
                border: `1px solid ${categoryColor}`,
                borderRadius: "6px",
                padding: "12px 14px",
                pointerEvents: "auto",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                zIndex: 65,
                fontFamily: "'JetBrains Mono', monospace",
                width: (pathData?.category === "generic" || !pathData?.description) ? "auto" : "420px",
                minWidth: (pathData?.category === "generic" || !pathData?.description) ? "140px" : "320px",
                maxWidth: "420px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => {
                  const allPaths = blockSvgRef.current?.querySelectorAll("path") ?? [];
                  allPaths.forEach((p) => (p as SVGPathElement).setAttribute("stroke", "none"));
                  if (clickedPath) {
                    setVisitedPaths(prev => new Set([...prev, clickedPath.index]));
                  }
                  setClickedPath(null);
                }}
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#ccc",
                  padding: "0 4px",
                  lineHeight: "1",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#999")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}
              >
                ✕
              </button>

              {pathData ? (
                pathData.category === "generic" ? (
                  /* Generic popup - centered text only */
                  <div style={{
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#555",
                    lineHeight: "1.5",
                    padding: "4px 0",
                  }}>
                    {pathData.description}
                  </div>
                ) : (
                  /* Regular popup - category, name, description, links */
                  <div style={{ paddingRight: "18px" }}>
                    {/* Category tag (left) and Name (right) */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: "6px",
                    }}>
                      <span style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: categoryColor,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}>
                        {pathData.category}
                      </span>
                      <span style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#222",
                        textAlign: "right",
                        flex: 1,
                        marginLeft: "8px",
                      }}>
                        {(pathData.category === "experience" || pathData.category === "education") && pathData.company
                          ? pathData.company
                          : pathData.name}
                      </span>
                    </div>

                    {/* Divider */}
                    <div style={{
                      height: "1px",
                      background: categoryColor,
                      opacity: 0.3,
                      marginBottom: "6px",
                    }} />

                    {/* Description or prominent links */}
                    {(pathData.description || pathData.entries || pathData.items?.length) ? (
                      pathData.entries ? (
                        /* Multi-entry layout (e.g. multiple degrees) */
                        <div style={{ marginBottom: "8px" }}>
                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "auto 1fr",
                            gap: "5px 12px",
                            fontSize: "13px",
                          }}>
                            {pathData.entries.map((entry, i) => (
                              <React.Fragment key={i}>
                                <div style={{
                                  fontWeight: 600,
                                  color: categoryColor,
                                  lineHeight: "1.4",
                                  whiteSpace: "nowrap",
                                }}>
                                  {entry.date}
                                </div>
                                <div style={{
                                  color: "#000",
                                  fontWeight: 600,
                                  lineHeight: "1.4",
                                }}>
                                  {entry.title}
                                </div>
                              </React.Fragment>
                            ))}
                          </div>
                          {pathData.subtext && (
                            <div style={{
                              marginTop: "6px",
                              fontSize: "12px",
                              color: "#000",
                              lineHeight: "1.6",
                              whiteSpace: "pre-line",
                            }}>
                              {pathData.subtext}
                            </div>
                          )}
                        </div>
                      ) : (pathData.category === "experience" || pathData.category === "education") && pathData.date ? (
                        /* Columnar layout for experience/education */
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "auto 1fr",
                          gap: "8px 12px",
                          fontSize: "9px",
                          marginBottom: "8px",
                        }}>
                          {/* Date column */}
                          <div style={{
                            fontWeight: 600,
                            color: categoryColor,
                            lineHeight: "1.4",
                            fontSize: "13px",
                          }}>
                            {pathData.date}
                          </div>

                          {/* Role — right of date */}
                          <div style={{
                            fontSize: "13px",
                            color: "#000",
                            fontWeight: 600,
                            marginBottom: "2px",
                          }}>
                            {pathData.role ?? pathData.name}
                          </div>

                          {/* Items + description span full width */}
                          <div style={{
                            gridColumn: "1 / -1",
                            color: "#000",
                            lineHeight: "1.5",
                            fontSize: "12px",
                          }}>
                            {pathData.items && pathData.items.map((item, idx) => (
                              <div key={idx} style={{ marginBottom: "2px" }}>
                                • {typeof item === "string" ? item : item.label}
                              </div>
                            ))}
                            {pathData.description && (
                              <div style={{ marginTop: pathData.items?.length ? "4px" : 0, color: "#555" }}>
                                {pathData.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Regular description or items list */
                        <div>
                          {pathData.items && pathData.items.length > 0 ? (
                            /* Items list for interests */
                            <div style={{
                              marginBottom: "8px",
                            }}>
                              <div style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#222",
                                marginBottom: "4px",
                              }}>
                                {pathData.description}
                              </div>
                              <div style={{
                                fontSize: "12px",
                                color: "#000",
                                lineHeight: "1.5",
                              }}>
                                {/* Image grid for items that have images */}
                                {pathData.items.some(i => typeof i !== "string" && i.image) ? (
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "4px" }}>
                                    {pathData.items.map((item, idx) => {
                                      if (typeof item === "string" || !item.image) return null;
                                      return (
                                        <a key={idx} href={item.href} target="_blank" rel="noopener noreferrer"
                                          style={{ display: "block", textDecoration: "none" }}
                                          title={item.label}
                                        >
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img src={item.image} alt={item.label}
                                            style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: "3px", display: "block" }}
                                          />
                                          <div style={{ fontSize: "10px", color: "#555", textAlign: "center", marginTop: "2px", lineHeight: 1.2 }}>{item.label}</div>
                                        </a>
                                      );
                                    })}
                                  </div>
                                ) : pathData.items.map((item, idx) => {
                                  if (typeof item === "string") {
                                    return <div key={idx} style={{ marginBottom: "2px" }}>• {item}</div>;
                                  }
                                  // Audio button
                                  if (item.audio) {
                                    const isPlaying = playingAudio === item.audio;
                                    return (
                                      <div key={idx} style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <button
                                          onClick={() => {
                                            if (isPlaying) {
                                              audioRef.current?.pause();
                                              setPlayingAudio(null);
                                              window.dispatchEvent(new Event("sax-audio-end"));
                                            } else {
                                              if (audioRef.current) audioRef.current.pause();
                                              const a = new Audio(item.audio);
                                              a.volume = audioVolume;
                                              audioRef.current = a;
                                              a.play();
                                              window.dispatchEvent(new Event("sax-audio-start"));
                                              setPlayingAudio(item.audio!);
                                              a.onended = () => {
                                                setPlayingAudio(null);
                                                window.dispatchEvent(new Event("sax-audio-end"));
                                              };
                                            }
                                          }}
                                          style={{
                                            width: 26, height: 26, borderRadius: "50%",
                                            border: `1.5px solid ${categoryColor}`,
                                            background: isPlaying ? categoryColor : "transparent",
                                            color: isPlaying ? "#fff" : categoryColor,
                                            cursor: "pointer", fontSize: "9px",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0, fontFamily: "inherit",
                                          }}
                                        >{isPlaying ? "■" : "▶"}</button>
                                        <span style={{ fontSize: "12px", color: "#000" }}>{item.label}</span>
                                      </div>
                                    );
                                  }
                                  // Golf form trigger
                                  if (item.action === "golf_form") {
                                    return (
                                      <div key={idx} style={{ marginBottom: "2px" }}>
                                        {"• "}
                                        <button
                                          onClick={() => { setGolfForm({ name: "", number: "" }); setGolfSent(false); setGolfError(""); }}
                                          style={{
                                            background: "none", border: "none", padding: 0, cursor: "pointer",
                                            color: categoryColor, textDecoration: "underline", textUnderlineOffset: "2px",
                                            fontSize: "12px", fontFamily: "inherit", fontWeight: 600,
                                          }}
                                        >{item.label}</button>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div key={idx} style={{ marginBottom: "2px", marginLeft: item.sub ? "10px" : "0" }}>
                                      {item.sub ? "◦" : "•"}{" "}
                                      {item.href ? (
                                        <a href={item.href} target="_blank" rel="noopener noreferrer"
                                          style={{ color: "#000", textDecoration: "underline", textUnderlineOffset: "2px" }}>
                                          {item.label}
                                        </a>
                                      ) : item.label}
                                    </div>
                                  );
                                })}
                              </div>
                              {/* Volume slider — only when card has audio items */}
                              {pathData.items?.some(i => typeof i !== "string" && i.audio) && (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", paddingTop: "8px", borderTop: `1px solid ${categoryColor}22` }}>
                                  <span style={{ fontSize: "10px", color: "#888", whiteSpace: "nowrap" }}>🔊</span>
                                  <input
                                    type="range" min={0} max={1} step={0.01}
                                    value={audioVolume}
                                    onChange={e => {
                                      const v = parseFloat(e.target.value);
                                      setAudioVolume(v);
                                      if (audioRef.current) audioRef.current.volume = v;
                                    }}
                                    style={{ flex: 1, accentColor: categoryColor, cursor: "pointer", height: "4px" }}
                                  />
                                  <span style={{ fontSize: "10px", color: "#888", minWidth: "28px", textAlign: "right" }}>{Math.round(audioVolume * 100)}%</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Regular description */
                            <div style={{
                              fontSize: "13px",
                              color: "#000",
                              lineHeight: "1.4",
                              marginBottom: "8px",
                            }}>
                              {pathData.description}
                            </div>
                          )}
                        </div>
                      )
                    ) : pathData.links && pathData.links.length > 0 ? (
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}>
                        {pathData.links.map((link, idx) => {
                          const url = link.github || link.instagram || link.printables || link.external;
                          if (!url) return null;
                          let icon = "🔗";
                          let showIcon = true;
                          if (link.instagram) icon = "📷";
                          else if (link.github) icon = "🔗";
                          else if (link.printables) icon = "🖨️";
                          else if (link.external) {
                            if (url.startsWith("tel:")) icon = "📱";
                            else if (url.startsWith("mailto:")) icon = "✉️";
                            else if (url.includes("linkedin")) icon = "💼";
                            else showIcon = true;
                            // Don't show icons for external links (contact info)
                            if (pathData.category === "about") showIcon = false;
                          }
                          return (
                            <a
                              key={idx}
                              href={url}
                              target={url.startsWith("tel:") || url.startsWith("mailto:") ? undefined : "_blank"}
                              rel="noopener noreferrer"
                              style={{
                                fontSize: "14px",
                                color: "#000",
                                textDecoration: "none",
                                fontWeight: 600,
                                transition: "opacity 0.2s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
                              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                            >
                              🔗 {link.label || "Link"}
                            </a>
                          );
                        })}
                      </div>
                    ) : null}

                    {/* Links footer - only show if there's also a description */}
                    {pathData.description && pathData.links && pathData.links.length > 0 && (
                      <div style={{
                        display: "flex",
                        gap: "6px",
                        flexWrap: "wrap",
                        borderTop: `1px solid ${categoryColor}44`,
                        paddingTop: "6px",
                        marginTop: "6px",
                      }}>
                        {pathData.links.map((link, idx) => {
                          const url = link.github || link.instagram || link.printables || link.external;
                          if (!url) return null;
                          const isExternal = link.external && !url.startsWith("tel:") && !url.startsWith("mailto:");
                          return (
                            <a
                              key={idx}
                              href={url}
                              target={url.startsWith("tel:") || url.startsWith("mailto:") ? undefined : "_blank"}
                              rel="noopener noreferrer"
                              style={{
                                fontSize: "12px",
                                color: "#000",
                                textDecoration: isExternal ? "underline" : "none",
                                textUnderlineOffset: "3px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                                transition: "opacity 0.2s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
                              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                            >
                              {link.label || "Link"}
                              {isExternal && (
                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                                  <path d="M2 10L10 2M10 2H5M10 2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </a>
                          );
                        })}
                      </div>
                    )}
                    {/* Inline image */}
                    {pathData.image && (
                      <div style={{ marginTop: "8px", borderRadius: "4px", overflow: "hidden" }}>
                        {pathData.imageLink ? (
                          <a href={pathData.imageLink} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={pathData.image} alt="" style={{ width: "100%", display: "block", objectFit: "cover" }} onError={e => { (e.currentTarget.parentElement!.parentElement as HTMLElement).style.display = "none"; }} />
                          </a>
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={pathData.image} alt="" style={{ width: "100%", display: "block", objectFit: "cover" }} onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {pathData.tags && pathData.tags.length > 0 && (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px", width: "100%" }}>
                        {pathData.tags.map(tag => (
                          <span key={tag} style={{
                            flex: 1,
                            textAlign: "center",
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            padding: "3px 6px",
                            border: `1px solid ${categoryColor}`,
                            color: categoryColor,
                            borderRadius: "2px",
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div style={{ fontSize: "14px", color: "#000" }}>
                  Path #{clickedPath.index}
                </div>
              )}
            </div>
          </>
        );
      })()}
    </div>
  );
}
