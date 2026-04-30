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

/**
 * HotspotModal Component
 * 
 * A dynamic, responsive modal system that displays content for workshop hotspots.
 * 
 * Features:
 * - Dynamic Positioning: On desktop, it anchors near the clicked hotspot with an arrow.
 * - Mobile Optimized: Automatically centers and scales for touch devices.
 * - Polymorphic Content: Renders different sub-components (Project, Experience, Link, etc.)
 *   based on the hotspot category.
 * - Viewport Awareness: Ensures the modal never bleeds off the screen edges.
 */
interface Props {
  hotspot: Hotspot | null;
  clickOrigin: { x: number; y: number } | null;
  containerRect: DOMRect | null;
  onClose: () => void;
}

export default function HotspotModal({ hotspot, clickOrigin, containerRect, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
            initial={{ opacity: 0, scale: 0.92, x: "-50%", y: "-50%" }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: "-50%",
              y: "-50%" 
            }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              zIndex: 25,
              width: "min(380px, calc(100vw - 32px))",
              maxHeight: "85vh",
              overflowY: "auto",
              background: "#ffffff",
              border: `1px solid ${catColor}30`,
              borderLeft: `1px solid ${catColor}30`,
              borderRight: `1px solid ${catColor}30`,
              borderTop: `3px solid ${catColor}`,
              boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
              fontFamily: "'JetBrains Mono', monospace",
              borderRadius: isMobile ? "8px" : "0",
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
