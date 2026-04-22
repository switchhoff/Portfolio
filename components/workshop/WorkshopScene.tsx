"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { getMappedHotspots, getCategoryColor, type Hotspot } from "@/lib/hotspots-config";
import { BLOCK_MAPPINGS, CATEGORY_COLORS } from "@/lib/svgBlockMappings";
import { getPathData } from "@/lib/pathData";
import { WeatherWindow } from "./WeatherWindow";

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

  const FILTER_GROUPS: Record<string, number[]> = Object.fromEntries(
    Object.entries(BLOCK_MAPPINGS)
      .filter(([k]) => k !== "generic")
      .map(([category, blocks]) => [
        category,
        blocks.flatMap(b => [b.fillPath, b.strokePath]),
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
        top: "12px",
        right: "12px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        zIndex: 60,
        background: "rgba(10,15,10,0.82)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,215,0,0.25)",
        borderRadius: "6px",
        overflow: "hidden",
        minWidth: "140px",
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
            padding: "8px 12px",
            cursor: "pointer",
            borderBottom: "1px solid rgba(255,215,0,0.15)",
            userSelect: "none",
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#FFD700" }}>
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
                padding: "7px 12px",
                cursor: cheatMode ? "pointer" : "not-allowed",
                opacity: cheatMode ? 1 : 0.35,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                userSelect: "none",
                transition: "opacity 0.2s",
              }}
            >
              <span style={{
                fontSize: 9, fontWeight: 600, letterSpacing: "0.1em",
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
      {/* Weather window SVG layer — same coordinate space as blocks */}
      <svg
        viewBox="0 0 960 540"
        style={{
          position: "absolute",
          inset: 0,
          left: "-0.73%",
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
          left: "-0.73%",
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
            fontSize: "9px", color: "#000",
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
                zIndex: 40,
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
                zIndex: 50,
                fontFamily: "'JetBrains Mono', monospace",
                width: (pathData?.category === "generic" || !pathData?.description) ? "auto" : "280px",
                minWidth: (pathData?.category === "generic" || !pathData?.description) ? "120px" : "240px",
                maxWidth: "280px",
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
                    fontSize: "9px",
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
                        fontSize: "9px",
                        fontWeight: 700,
                        color: categoryColor,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}>
                        {pathData.category}
                      </span>
                      <span style={{
                        fontSize: "11px",
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
                            fontSize: "9px",
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
                              fontSize: "8px",
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
                            fontSize: "9px",
                          }}>
                            {pathData.date}
                          </div>

                          {/* Role/name — right of date */}
                          {pathData.name && (
                            <div style={{
                              fontSize: "9px",
                              color: "#000",
                              fontWeight: 600,
                              marginBottom: "2px",
                            }}>
                              {pathData.name}
                            </div>
                          )}

                          {/* Description spans full width */}
                          <div style={{
                            gridColumn: "1 / -1",
                            color: "#000",
                            lineHeight: "1.3",
                            fontSize: "8px",
                          }}>
                            {pathData.description}
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
                                fontSize: "9px",
                                fontWeight: 600,
                                color: "#222",
                                marginBottom: "4px",
                              }}>
                                {pathData.description}
                              </div>
                              <div style={{
                                fontSize: "8px",
                                color: "#000",
                                lineHeight: "1.5",
                              }}>
                                {pathData.items.map((item, idx) => {
                                  if (typeof item === "string") {
                                    return (
                                      <div key={idx} style={{ marginBottom: "2px" }}>• {item}</div>
                                    );
                                  }
                                  return (
                                    <div key={idx} style={{ marginBottom: "2px", marginLeft: item.sub ? "10px" : "0" }}>
                                      {item.sub ? "◦" : "•"}{" "}
                                      {item.href ? (
                                        <a href={item.href} target="_blank" rel="noopener noreferrer"
                                          style={{ color: "#000", textDecoration: "underline" }}>
                                          {item.label}
                                        </a>
                                      ) : item.label}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            /* Regular description */
                            <div style={{
                              fontSize: "9px",
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
                                fontSize: "10px",
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
                          return (
                            <a
                              key={idx}
                              href={url}
                              target={url.startsWith("tel:") || url.startsWith("mailto:") ? undefined : "_blank"}
                              rel="noopener noreferrer"
                              style={{
                                fontSize: "8px",
                                color: "#000",
                                textDecoration: "none",
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
                    )}
                    {/* Tags */}
                    {pathData.tags && pathData.tags.length > 0 && (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px", width: "100%" }}>
                        {pathData.tags.map(tag => (
                          <span key={tag} style={{
                            flex: 1,
                            textAlign: "center",
                            fontSize: "7px",
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
                <div style={{ fontSize: "10px", color: "#000" }}>
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
