"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  type Hotspot, getCategoryColor,
  isProject, isPopup, isExperience, isLink, isForm, isStatus, isAbout,
} from "@/lib/hotspots-config";
import ProjectContent from "./ProjectContent";
import PopupContent from "./PopupContent";
import ExperienceContent from "./ExperienceContent";
import LinkContent from "./LinkContent";
import FormContent from "./FormContent";
import StatusContent from "./StatusContent";
import AboutContent from "./AboutContent";

interface Props {
  hotspot: Hotspot | null;
  clickOrigin: { x: number; y: number } | null;
  containerRect: DOMRect | null;
  onClose: () => void;
}

export default function HotspotModal({ hotspot, clickOrigin, containerRect, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; arrowSide: "left" | "right" }>({ left: 0, top: 0, arrowSide: "left" });
  const computePosition = useCallback(() => {
    if (!containerRect || !modalRef.current) return;
    const modal = modalRef.current.getBoundingClientRect();
    const mw = modal.width || 380;
    const mh = modal.height || 300;
    // If no click origin (e.g. cheat guide), center in container
    const origin = clickOrigin ?? { x: containerRect.width / 2, y: containerRect.height / 2 };

    // Center popup exactly on cursor (container-relative coords → viewport coords for position:fixed)
    let left = origin.x - mw / 2;
    let arrowSide: "left" | "right" = "left";

    // Clamp horizontally within container
    left = Math.max(8, Math.min(left, containerRect.width - mw - 8));

    // Center vertically on cursor, clamp to container
    let top = origin.y - mh / 2;
    top = Math.max(8, Math.min(top, containerRect.height - mh - 8));

    setPos({ left, top, arrowSide });
  }, [clickOrigin, containerRect]);

  useEffect(() => {
    if (hotspot) {
      requestAnimationFrame(() => requestAnimationFrame(computePosition));
    }
  }, [hotspot, computePosition]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const catColor = hotspot ? getCategoryColor(hotspot.category) : "#999";

  function renderContent(h: Hotspot) {
    if (isProject(h)) return <ProjectContent hotspot={h} />;
    if (isPopup(h)) return <PopupContent hotspot={h} />;
    if (isExperience(h)) return <ExperienceContent hotspot={h} />;
    if (isLink(h)) return <LinkContent hotspot={h} />;
    if (isForm(h)) return <FormContent hotspot={h} />;
    if (isStatus(h)) return <StatusContent hotspot={h} />;
    if (isAbout(h)) return <AboutContent hotspot={h} />;
    return null;
  }

  return (
    <AnimatePresence>
      {hotspot && (
        <>
          {/* Backdrop — click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: "absolute", inset: 0, zIndex: 20,
              background: "rgba(0,0,0,0.05)",
            }}
          />

          {/* Tooltip card */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "absolute",
              left: pos.left,
              top: pos.top,
              zIndex: 25,
              width: 380,
              maxHeight: "70vh",
              overflowY: "auto",
              background: "#ffffff",
              border: `1px solid ${catColor}30`,
              borderLeft: pos.arrowSide === "left" ? `3px solid ${catColor}` : `1px solid ${catColor}30`,
              borderRight: pos.arrowSide === "right" ? `3px solid ${catColor}` : `1px solid ${catColor}30`,
              boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "14px 16px 10px",
              borderBottom: `1px solid ${catColor}15`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{
                  fontSize: 8, fontWeight: 700, color: catColor,
                  letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 3,
                }}>
                  {hotspot.category}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1a2e1f" }}>
                  {hotspot.label}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 16, color: "#9aaa94", padding: "4px 8px",
                  fontFamily: "inherit", lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: "14px 16px 16px" }}>
              {renderContent(hotspot)}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
