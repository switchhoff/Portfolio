"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { getMappedHotspots, getCategoryColor, type Hotspot } from "@/lib/hotspots-config";
import { BLOCK_MAPPINGS, CATEGORY_COLORS } from "@/lib/svgBlockMappings";
import { getPathData } from "@/lib/pathData";
import { WeatherWindow } from "./WeatherWindow";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { GithubIcon, LinkedinIcon, InstagramIcon, PhoneIcon, MailIcon, PrinterIcon, ExternalLinkIcon, GlobeIcon } from "@/components/icons";

interface Props {
  /** Callback for when a hotspot is clicked */
  onHotspotClick: (hotspot: Hotspot, clickOrigin: { x: number; y: number }) => void;
  /** Current active hotspot ID for highlighting */
  activeId: string | null;
  /** Category to highlight (e.g., from external filters) */
  highlightCategory: string | null;
  /** Callback for when hovering changes */
  onHoverChange?: (hotspot: Hotspot | null) => void;
  /** Enable/disable dark mode styling */
  darkMode?: boolean;
}

const LinkDock = ({ links, categoryColor }: { links: any[], categoryColor: string }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    const handleWindowClick = () => setActiveIdx(null);
    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, []);

  return (
    <div style={{ display: "flex", gap: "20px", justifyContent: "center", alignItems: "center", margin: "16px 0 8px 0" }}>
      {links.map((link, idx) => {
        let icon = <ExternalLinkIcon size={24} />;
        if (link.icon === 'instagram') icon = <InstagramIcon size={24} />;
        else if (link.icon === 'printables') icon = <PrinterIcon size={24} />;
        else if (link.icon === 'linkedin') icon = <LinkedinIcon size={24} />;
        else if (link.icon === 'mail') icon = <MailIcon size={24} />;
        else if (link.icon === 'phone') icon = <PhoneIcon size={24} />;
        else if (link.icon === 'github') icon = <GithubIcon size={24} />;
        else if (link.icon === 'globe') icon = <GlobeIcon size={24} />;

        return (
          <div key={idx} style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (activeIdx === idx) {
                  // Act as link
                  if (link.url.startsWith("tel:") || link.url.startsWith("mailto:")) {
                    window.location.href = link.url;
                  } else {
                    window.open(link.url, "_blank");
                  }
                  setActiveIdx(null);
                } else {
                  setActiveIdx(idx);
                }
              }}
              style={{
                background: "none",
                border: "none",
                padding: "4px",
                cursor: "pointer",
                color: "#333",
                transition: "transform 0.2s, color 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: activeIdx === idx ? "scale(1.15)" : "scale(1)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = categoryColor; setActiveIdx(idx); }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#333"; setActiveIdx(null); }}
            >
              {icon}
            </button>
            
            <div style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              background: "#333",
              color: "#fff",
              padding: "6px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              whiteSpace: "nowrap",
              fontWeight: 600,
              pointerEvents: "none",
              opacity: activeIdx === idx ? 1 : 0,
              transform: activeIdx === idx ? "translateY(0)" : "translateY(4px)",
              transition: "opacity 0.2s, transform 0.2s",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              zIndex: 20
            }}>
              {link.label}
              <div style={{
                position: "absolute",
                bottom: "-4px",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid #333",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

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

function GalleryCarousel({ images, categoryColor, aspectRatio = "4/3", objectFit = "cover", style }: { 
  images: {src: string, alt?: string, link?: string, label?: string, style?: React.CSSProperties}[], 
  categoryColor: string,
  aspectRatio?: string,
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down",
  style?: React.CSSProperties
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const scroll = (dir: "left" | "right") => {
    setActiveIndex(prev => {
      if (dir === "left") return Math.max(0, prev - 1);
      return Math.min(images.length - 1, prev + 1);
    });
  };

  return (
    <div style={{ position: "relative", marginBottom: "12px", ...style }}>
      <div 
        style={{ 
          position: "relative",
          width: "100%",
          aspectRatio: aspectRatio,
          display: "flex", 
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: "8px"
        }}
      >
        {images.map((img, i) => {
          const offset = i - activeIndex;
          const absOffset = Math.abs(offset);
          const scale = absOffset === 0 ? 1 : Math.max(0.7, 1 - absOffset * 0.15);
          const opacity = absOffset === 0 ? 1 : Math.max(0, 0.6 - absOffset * 0.2);
          const zIndex = 10 - absOffset;
          const translateX = offset * 60; // percentage
          
          return (
            <div 
              key={i} 
              style={{ 
                position: "absolute",
                transition: "all 0.3s ease-out",
                transform: `translateX(${translateX}%) scale(${scale})`,
                opacity: opacity,
                zIndex: zIndex,
                width: "80%",
                height: "100%",
                boxShadow: absOffset === 0 ? "0 10px 20px rgba(0,0,0,0.3)" : "0 4px 8px rgba(0,0,0,0.1)",
                borderRadius: "8px",
                overflow: "hidden",
                cursor: absOffset === 0 ? "default" : "pointer",
              }}
              onClick={() => setActiveIndex(i)}
            >
              {img.link ? (
                <a href={absOffset === 0 ? img.link : undefined} target="_blank" rel="noopener noreferrer" style={{ display: "block", height: "100%" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt || ""} style={{ width: "100%", height: "100%", display: "block", objectFit: objectFit, ...img.style }} />
                </a>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={img.src} alt={img.alt || ""} style={{ width: "100%", height: "100%", display: "block", objectFit: objectFit, ...img.style }} />
              )}
            </div>
          );
        })}
      </div>
      
      <div style={{ 
        textAlign: "center", 
        marginTop: "12px", 
        minHeight: "34px",
      }}>
        <div style={{ 
          fontSize: "13px", 
          fontWeight: 600, 
          color: "#333",
        }}>
          {images[activeIndex]?.label || ""}
        </div>
        {images[activeIndex]?.link && (
          <a 
            href={images[activeIndex].link} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              fontSize: "11px", 
              color: categoryColor, 
              textDecoration: "underline", 
              display: "block",
              marginTop: "2px"
            }}
          >
            Visit Artist Website →
          </a>
        )}
      </div>

      {images.length > 1 && (
        <>
          {activeIndex > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); scroll("left"); }}
              style={{ position: "absolute", left: "-10px", top: "calc(50% - 8px)", transform: "translateY(-50%)", background: categoryColor, color: "#fff", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", zIndex: 20, opacity: 0.9, boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
            >
              {"<"}
            </button>
          )}
          {activeIndex < images.length - 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); scroll("right"); }}
              style={{ position: "absolute", right: "-10px", top: "calc(50% - 8px)", transform: "translateY(-50%)", background: categoryColor, color: "#fff", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", zIndex: 20, opacity: 0.9, boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
            >
              {">"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

/**
 * WorkshopScene Component
 * 
 * This is the core interactive layer of the "Fun" view. It renders an SVG-based 
 * representation of a workshop scene with clickable "blocks" (paths) and hotspots.
 * 
 * Key Features:
 * 1. Interactive Blocks: SVG paths that change color on hover/click based on category.
 * 2. Hotspots: Hidden interactive zones that trigger modals when clicked.
 * 3. Cheats Menu: A floating toggle system to reveal interactive elements.
 * 4. Responsive Layout: Adapts positioning and scaling for mobile vs desktop.
 * 5. Audio Integration: Supports ambient and directional sound effects.
 */
export default function WorkshopScene({ onHotspotClick, activeId, highlightCategory, onHoverChange, darkMode }: Props) {
  const dm = darkMode ?? false;
  const [isMobile, setIsMobile] = useState(false);
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
  const [showOverland, setShowOverland] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioVolume, setAudioVolume] = useState(0.1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // -- RESPONSIVENESS --
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // -- HOTSPOT CONFIG --
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

                  const rect = containerRef.current?.getBoundingClientRect();
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

                  const rect = containerRef.current?.getBoundingClientRect();
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

  useEffect(() => {
    if (!cheatMode) {
      const allPaths = blockSvgRef.current?.querySelectorAll("path") ?? [];
      allPaths.forEach((p) => {
        const path = p as SVGPathElement;
        path.setAttribute("fill-opacity", "0.01");
        path.setAttribute("stroke", "none");
      });
    }
  }, [cheatMode]);

  // Apply filter highlighting
  useEffect(() => {
    const allPaths = blockSvgRef.current?.querySelectorAll("path") ?? [];
    allPaths.forEach((p, idx) => {
      const path = p as SVGPathElement;
      if (filterPaths && filterPaths.has(idx)) {
        // Cheat colour outline
        const color = path.getAttribute("data-color") || "#45B7D1";
        path.setAttribute("fill-opacity", "0.01");
        path.setAttribute("stroke", color);
        path.setAttribute("stroke-width", "1.5");
      } else {
        path.setAttribute("fill-opacity", "0.01");
        path.setAttribute("stroke", "none");
      }
    });
  }, [activeFilters, visitedPaths]);

  // Keep ref in sync so addEventListener callbacks can access current visited set
  useEffect(() => { visitedPathsRef.current = visitedPaths; }, [visitedPaths]);



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
      {/* ── CHEATS MENU BAR ── */}
      <motion.div
        drag={!isMobile}
        dragMomentum={false}
        style={{
          position: "fixed",
          top: isMobile ? "auto" : "50%",
          bottom: isMobile ? "0" : "auto",
          right: isMobile ? "0" : "20px",
          left: isMobile ? "0" : "auto",
          transform: isMobile ? undefined : "translateY(-50%)",
          width: isMobile ? "100%" : "180px",
          display: "flex",
          flexDirection: isMobile ? "column" : "column",
          gap: 0,
          zIndex: 55,
        // Adapt to dark mode
        background: dm ? "rgba(10, 15, 10, 0.95)" : "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        borderTop: isMobile ? (dm ? "1px solid rgba(255, 215, 0, 0.25)" : "1px solid rgba(0, 0, 0, 0.1)") : (dm ? "1px solid rgba(255, 215, 0, 0.25)" : "1px solid rgba(0, 0, 0, 0.1)"),
        borderRight: isMobile ? "none" : (dm ? "1px solid rgba(255, 215, 0, 0.25)" : "1px solid rgba(0, 0, 0, 0.1)"),
        borderBottom: isMobile ? "none" : (dm ? "1px solid rgba(255, 215, 0, 0.25)" : "1px solid rgba(0, 0, 0, 0.1)"),
        borderLeft: isMobile ? "none" : (dm ? "1px solid rgba(255, 215, 0, 0.25)" : "1px solid rgba(0, 0, 0, 0.1)"),
        borderRadius: isMobile ? "0" : "12px",
        overflow: "hidden",
        minWidth: isMobile ? "100%" : "180px",
        fontFamily: "'JetBrains Mono', monospace",
        boxShadow: dm ? "0 -4px 32px rgba(0,0,0,0.5)" : "0 -4px 32px rgba(0,0,0,0.1)",
        transition: isMobile ? "all 0.3s ease" : "background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease",
        cursor: isMobile ? "default" : "grab",
      }}>
        {/* ── CHEATS MASTER TOGGLE — full-width row (mobile: top row; desktop: top of column) ── */}
        <div
          onClick={() => {
            setCheatMode(!cheatMode);
            if (cheatMode) setActiveFilters(new Set());
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobile ? "10px 16px" : "12px 16px",
            cursor: "pointer",
            borderBottom: dm ? "1px solid rgba(255, 215, 0, 0.15)" : "1px solid rgba(0, 0, 0, 0.08)",
            userSelect: "none",
            background: cheatMode ? (dm ? "rgba(255, 215, 0, 0.05)" : "rgba(217, 119, 6, 0.03)") : "transparent",
            flexShrink: 0,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: dm ? "#FFD700" : "#d97706" }}>
              CHEATS
            </span>
            {!isMobile && (
              <span style={{ fontSize: 8, fontWeight: 400, letterSpacing: "0.04em", color: dm ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", fontStyle: "italic", lineHeight: 1.4 }}>
                This menu can<br />be moved
              </span>
            )}
          </div>
          <div style={{
            width: 32, height: 16,
            background: cheatMode ? (dm ? "#FFD700" : "#d97706") : (dm ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
            borderRadius: 8, position: "relative", transition: "all 0.2s ease", flexShrink: 0,
          }}>
            <div style={{
              position: "absolute", top: 2, left: cheatMode ? 18 : 2,
              width: 12, height: 12, borderRadius: "50%",
              background: cheatMode ? (dm ? "#000" : "#fff") : (dm ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)"),
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }} />
          </div>
        </div>

        {/* ── CATEGORY FILTER ROWS — horizontal scroll row on mobile, column on desktop ── */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          overflowX: isMobile ? "auto" : "visible",
          overflowY: isMobile ? "visible" : "auto",
          flex: isMobile ? "none" : 1,
        }}>
        {Object.entries(FILTER_GROUPS).map(([name, paths]) => {
          const categoryColor = CATEGORY_COLORS[name] || "#999999";
          const isActive = activeFilters.has(name);
          return (
            <div
              key={name}
              onClick={() => {
                if (!cheatMode) return; // Only allow category toggling if master cheat is ON
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
                padding: isMobile ? "10px 20px" : "10px 16px",
                cursor: cheatMode ? "pointer" : "not-allowed",
                opacity: cheatMode ? 1 : 0.3,
                borderBottom: isMobile ? "none" : (dm ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.03)"),
                borderRight: isMobile ? (dm ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.03)") : "none",
                userSelect: "none",
                transition: "all 0.2s ease",
                background: isActive ? `${categoryColor}10` : "transparent",
                flexShrink: 0,
                minWidth: isMobile ? "110px" : "auto",
                gap: isMobile ? "12px" : "0",
              }}
            >
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: isActive ? categoryColor : (dm ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)"),
                transition: "color 0.2s",
              }}>
                {name}
              </span>
              {/* Category Sliding Toggle */}
              <div style={{
                width: 28, height: 14,
                background: isActive ? categoryColor : (dm ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"),
                borderRadius: 7,
                position: "relative",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}>
                <div style={{
                  position: "absolute",
                  top: 2, left: isActive ? 16 : 2,
                  width: 10, height: 10,
                  borderRadius: "50%",
                  background: isActive ? (dm ? "#000" : "#fff") : (dm ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)"),
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }} />
              </div>
            </div>
          );
        })}
        </div>
      </motion.div>
      {/* Weather window SVG layer — same coordinate space as blocks */}
      <svg
        viewBox="0 0 960 540"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          top: 0, bottom: 0,
          left: isMobile ? "-1.35%" : "-1.4%",
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
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          top: 0, bottom: 0,
          left: isMobile ? "-1.35%" : "-1.4%",
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
                        onHotspotClick(h, { x: e.clientX - rect.left, y: e.clientY - rect.top });
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
      {golfForm !== null && createPortal(
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 2999, background: "rgba(0,0,0,0.3)" }}
            onClick={() => setGolfForm(null)} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            background: dm ? "#141414" : "#fff", 
            border: `2px solid ${dm ? "#27ae60" : "#27ae60"}`, 
            borderRadius: isMobile ? "0" : "8px",
            padding: isMobile ? "24px 16px" : "20px 24px", 
            zIndex: 3000, 
            width: isMobile ? "100vw" : "400px",
            fontFamily: "'JetBrains Mono', monospace",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
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
        </>,
        document.body
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
            {createPortal(
              <>
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 2000,
                    background: "rgba(0,0,0,0.1)",
                    backdropFilter: "blur(2px)",
                  }}
                  onClick={() => {
                    const allPaths = blockSvgRef.current?.querySelectorAll("path") ?? [];
                    allPaths.forEach((p) => (p as SVGPathElement).setAttribute("stroke", "none"));
                    setClickedPath(null);
                  }}
                />
    

            {/* Popup Card */}
                <div
                  style={{
                    position: "fixed",
                    left: (pathData?.category === "generic") 
                      ? clickedPath.x 
                      : "50%",
                    top: (pathData?.category === "generic")
                      ? clickedPath.y
                      : "50%",
                    transform: "translate(-50%, -50%)",
                    background: "#ffffff",
                    border: `1px solid ${categoryColor}`,
                    borderRadius: isMobile ? "0" : "6px",
                    padding: "12px 14px",
                    pointerEvents: "auto",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                    zIndex: 2001,
                    fontFamily: "'JetBrains Mono', monospace",
                    width: isMobile 
                      ? (pathData?.category === "generic" ? "auto" : "100vw")
                      : ((pathData?.category === "generic" || !pathData?.description) ? "auto" : "min(420px, calc(100vw - 40px))"),
                    minWidth: (pathData?.category === "generic" || !pathData?.description) ? "140px" : "320px",
                    maxWidth: isMobile ? "100vw" : "420px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
              {/* Close button */}
              <button
                onClick={() => {
                  const allPaths = blockSvgRef.current?.querySelectorAll("path") ?? [];
                  allPaths.forEach((p) => (p as SVGPathElement).setAttribute("stroke", "none"));
                  if (clickedPath) {

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
                      display: "grid",
                      gridTemplateColumns: "1fr auto 1fr",
                      alignItems: "center",
                      marginBottom: "6px",
                      gap: "6px",
                    }}>
                      {/* Left — category */}
                      <span style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: categoryColor,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}>
                        {pathData.category}
                      </span>
                      {/* Centre — name + dev badge */}
                      <span style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#222",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        whiteSpace: "nowrap",
                      }}>
                        {pathData.icon === "globe" && <GlobeIcon size={16} style={{ color: categoryColor }} />}
                        {(pathData.category === "experience" || pathData.category === "education") && pathData.company
                          ? pathData.company
                          : pathData.name}
                      </span>
                      {/* Right — WIP tag */}
                      <span style={{ display: "flex", justifyContent: "flex-end" }}>
                        {pathData.wip && (
                          <span style={{
                            fontSize: "9px", fontWeight: 700,
                            color: "#f59e0b", background: "rgba(245,158,11,0.12)",
                            border: "1px solid rgba(245,158,11,0.35)",
                            borderRadius: "4px", padding: "2px 6px",
                            letterSpacing: "0.08em", textTransform: "uppercase",
                            whiteSpace: "nowrap",
                          }}>
                            WIP
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Divider */}
                    <div style={{
                      height: "1px",
                      background: categoryColor,
                      opacity: 0.3,
                      marginBottom: "6px",
                    }} />

                    {/* Content Block Renderer (NEW) or Legacy Description */}
                    {pathData.content && pathData.content.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "8px" }}>
                        {pathData.content.map((block, idx) => {
                          if (block.type === 'text') {
                            return <div key={idx} style={{ fontSize: "13px", color: "#333", lineHeight: "1.5" }}>{block.text}</div>;
                          }
                          if (block.type === 'image' || block.type === 'gif') {
                            return (
                              <div key={idx} style={{ 
                                borderRadius: "4px", 
                                overflow: "hidden",
                                aspectRatio: block.aspectRatio,
                                ...block.style
                              }}>
                                {block.link ? (
                                  <a href={block.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", height: "100%" }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={block.src} alt={block.alt || ""} style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
                                  </a>
                                ) : (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={block.src} alt={block.alt || ""} style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
                                )}
                              </div>
                            );
                          }
                          if (block.type === 'gallery') {
                            return <GalleryCarousel 
                              key={idx} 
                              images={block.images} 
                              categoryColor={categoryColor} 
                              aspectRatio={block.aspectRatio}
                              objectFit={block.objectFit}
                              style={block.style}
                            />;
                          }
                          if (block.type === 'audio') {
                            return (
                              <div key={idx} style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <button
                                  onClick={() => {
                                    if (playingAudio === block.src) {
                                      audioRef.current?.pause();
                                      setPlayingAudio(null);
                                      window.dispatchEvent(new Event("sax-audio-end"));
                                    } else {
                                      if (audioRef.current) audioRef.current.pause();
                                      const a = new Audio(block.src);
                                      a.volume = audioVolume;
                                      audioRef.current = a;
                                      a.play();
                                      window.dispatchEvent(new Event("sax-audio-start"));
                                      setPlayingAudio(block.src);
                                      a.onended = () => {
                                        setPlayingAudio(null);
                                        window.dispatchEvent(new Event("sax-audio-end"));
                                      };
                                    }
                                  }}
                                  style={{
                                    width: 26, height: 26, borderRadius: "50%",
                                    border: `1.5px solid ${categoryColor}`,
                                    background: playingAudio === block.src ? categoryColor : "transparent",
                                    color: playingAudio === block.src ? "#fff" : categoryColor,
                                    cursor: "pointer", fontSize: "9px",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, fontFamily: "inherit",
                                  }}
                                >{playingAudio === block.src ? "■" : "▶"}</button>
                                <span style={{ fontSize: "12px", color: "#333" }}>{block.label}</span>
                              </div>
                            );
                          }
                          if (block.type === 'link') {
                            let icon = <ExternalLinkIcon size={14} />;
                            if (block.icon === 'instagram') icon = <InstagramIcon size={14} />;
                            else if (block.icon === 'printables') icon = <PrinterIcon size={14} />;
                            else if (block.icon === 'linkedin') icon = <LinkedinIcon size={14} />;
                            else if (block.icon === 'mail') icon = <MailIcon size={14} />;
                            else if (block.icon === 'phone') icon = <PhoneIcon size={14} />;
                            else if (block.icon === 'github') icon = <GithubIcon size={14} />;
                            
                            return (
                              <a
                                key={idx}
                                href={block.url}
                                target={block.url.startsWith("tel:") || block.url.startsWith("mailto:") ? undefined : "_blank"}
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: block.fontSize || "14px",
                                  color: "#333",
                                  textDecoration: "none",
                                  fontWeight: 600,
                                  transition: "opacity 0.2s",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                              >
                                {icon} {block.label && <span>{block.label}</span>}
                              </a>
                            );
                          }
                          if (block.type === 'link_dock') {
                            return <LinkDock key={idx} links={block.links} categoryColor={categoryColor} />;
                          }
                          if (block.type === 'button' && block.action === 'golf_form') {
                            return (
                              <div key={idx} style={{ marginBottom: "2px" }}>
                                <button
                                  onClick={() => { setGolfForm({ name: "", number: "" }); setGolfSent(false); setGolfError(""); }}
                                  style={{
                                    background: "none", border: "none", padding: 0, cursor: "pointer",
                                    color: categoryColor, textDecoration: "underline", textUnderlineOffset: "2px",
                                    fontSize: "12px", fontFamily: "inherit", fontWeight: 600,
                                  }}
                                >{block.label}</button>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    ) : (pathData.description || pathData.entries || pathData.items?.length) ? (
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
                              fontSize: "13px",
                              color: "#333",
                              lineHeight: "1.5",
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
                            color: "#333",
                            lineHeight: "1.5",
                            fontSize: "13px",
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
                                      {item.action === "show_overland" ? (
                                        <button
                                          onClick={() => setShowOverland(true)}
                                          style={{
                                            background: "none", border: "none", padding: 0, cursor: "pointer",
                                            color: "#000", textDecoration: "underline", textUnderlineOffset: "2px",
                                            fontSize: "12px", fontFamily: "inherit", fontWeight: 400,
                                          }}
                                        >{item.label}</button>
                                      ) : item.href ? (
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
                                    type="range" min={0} max={0.3} step={0.01}
                                    value={audioVolume}
                                    onChange={e => {
                                      const v = parseFloat(e.target.value);
                                      setAudioVolume(v);
                                      if (audioRef.current) audioRef.current.volume = v;
                                    }}
                                    style={{ flex: 1, accentColor: categoryColor, cursor: "pointer", height: "4px" }}
                                  />
                                  <span style={{ fontSize: "10px", color: "#888", minWidth: "28px", textAlign: "right" }}>{Math.round((audioVolume / 0.3) * 100)}%</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Regular description */
                            <div>
                              <div style={{
                                fontSize: "13px",
                                color: "#333",
                                lineHeight: "1.5",
                                marginBottom: "8px",
                              }}>
                                {pathData.description}
                              </div>
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
                          let icon = <ExternalLinkIcon size={14} />;
                          if (link.instagram) icon = <InstagramIcon size={14} />;
                          else if (link.github) icon = <GithubIcon size={14} />;
                          else if (link.printables) icon = <PrinterIcon size={14} />;
                          else if (link.external) {
                            if (url.startsWith("tel:")) icon = <PhoneIcon size={14} />;
                            else if (url.startsWith("mailto:")) icon = <MailIcon size={14} />;
                            else if (url.includes("linkedin")) icon = <LinkedinIcon size={14} />;
                          }
                          return (
                            <a
                              key={idx}
                              href={url}
                              target={url.startsWith("tel:") || url.startsWith("mailto:") ? undefined : "_blank"}
                              rel="noopener noreferrer"
                              style={{
                                fontSize: "14px",
                                color: "#333",
                                textDecoration: "none",
                                fontWeight: 600,
                                transition: "opacity 0.2s",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
                              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                            >
                              {icon} {link.label || "Link"}
                            </a>
                          );
                        })}
                      </div>
                    ) : null}

                    {/* Links footer - only show if there's also a description */}
                    {pathData.description && pathData.links && pathData.links.length > 0 && (
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                        borderTop: `1px solid ${categoryColor}44`,
                        paddingTop: "8px",
                        marginTop: "8px",
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
                            <img 
                              src={pathData.image} 
                              alt="" 
                              style={{ 
                                width: "100%", 
                                display: "block", 
                                objectFit: "cover",
                                ...pathData.imageStyle
                              }} 
                              onError={e => { (e.currentTarget.parentElement!.parentElement as HTMLElement).style.display = "none"; }} 
                            />
                          </a>
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img 
                            src={pathData.image} 
                            alt="" 
                            style={{ 
                              width: "100%", 
                              display: "block", 
                              objectFit: "cover",
                              ...pathData.imageStyle
                            }} 
                            onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} 
                          />
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {pathData.tags && pathData.tags.length > 0 && (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px", width: "100%", alignItems: "stretch" }}>
                        {pathData.tags.map(tag => (
                          <span key={tag} style={{
                            flex: 1,
                            textAlign: "center",
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            padding: "4px 6px",
                            border: `1px solid ${categoryColor}`,
                            color: categoryColor,
                            borderRadius: "2px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: "24px", // Ensure minimum height for alignment
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
                  —
                </div>
              )}
                </div>
              </>,
              document.body
            )}
          </>
        );
      })()}

      {/* Overland Image Modal */}
      {showOverland && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.75)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px"
        }} onClick={() => setShowOverland(false)}>
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/overland.jpg" alt="Overland Track" style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: "8px", display: "block" }} />
            <button
              onClick={() => setShowOverland(false)}
              style={{
                position: "absolute", top: "-15px", right: "-15px",
                width: "30px", height: "30px", borderRadius: "50%",
                background: "#ef4444", color: "#fff", border: "2px solid #fff",
                fontSize: "16px", fontWeight: "bold", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
