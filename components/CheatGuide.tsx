"use client";
import { useState } from "react";
import {
  type Hotspot,
  CHEAT_GUIDE_CATEGORIES,
  getHotspotsByCategory,
  getCategoryColor,
} from "@/lib/hotspots-config";

interface Props {
  onHotspotSelect: (hotspot: Hotspot) => void;
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
}

export default function CheatGuide({ onHotspotSelect, activeCategory, onCategoryChange }: Props) {
  const [expanded, setExpanded] = useState(false);

  function handleTabClick(catId: string) {
    if (activeCategory === catId) {
      setExpanded(false);
      onCategoryChange(null);
    } else {
      setExpanded(true);
      onCategoryChange(catId);
    }
  }

  const activeHotspots = activeCategory ? getHotspotsByCategory(activeCategory) : [];

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 15,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* Chip tray — expands above tabs */}
      {expanded && activeCategory && activeHotspots.length > 0 && (
        <div style={{
          padding: "10px 16px",
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(12px)",
          borderTop: `1px solid ${getCategoryColor(activeCategory)}30`,
          display: "flex", gap: 6, flexWrap: "wrap",
          overflowX: "auto",
        }}>
          {activeHotspots.map(h => (
            <button
              key={h.id}
              onClick={() => onHotspotSelect(h)}
              style={{
                fontSize: 9, fontWeight: 600, letterSpacing: "0.06em",
                padding: "4px 10px",
                background: "rgba(255,255,255,0.9)",
                border: `1px solid ${getCategoryColor(activeCategory)}40`,
                color: getCategoryColor(activeCategory),
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              {h.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab bar */}
      <div style={{
        display: "flex",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(220,229,214,0.6)",
      }}>
        {CHEAT_GUIDE_CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleTabClick(cat.id)}
              style={{
                flex: 1,
                padding: "10px 8px 8px",
                background: isActive ? `${cat.color}12` : "transparent",
                border: "none",
                borderTop: isActive ? `2px solid ${cat.color}` : "2px solid transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                transition: "all 0.15s",
              }}
            >
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: isActive ? cat.color : "#9aaa94",
              }}>
                {cat.label}
              </span>
              <span style={{
                fontSize: 7, color: isActive ? cat.color : "#bcc8b6",
                letterSpacing: "0.05em",
              }}>
                {getHotspotsByCategory(cat.id).length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
