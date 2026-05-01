"use client";
import { useEffect, useRef, useState } from "react";
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
  darkMode?: boolean;
}

export default function HotspotModal({ hotspot, clickOrigin, containerRect, onClose, darkMode }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const dm = darkMode ?? false;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const catColor = hotspot ? getCategoryColor(hotspot.category) : "#999";
  const modalPos = { left: "50%", top: "50%" };

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 1000,
              background: dm ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.25)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Modal card */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.92, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "fixed",
              left: modalPos.left,
              top: modalPos.top,
              zIndex: 1001,
              width: isMobile ? "100vw" : "min(380px, calc(100vw - 32px))",
              maxWidth: "100vw",
              maxHeight: "85vh",
              overflowY: "auto",
              background: dm ? "#141414" : "#ffffff",
              borderTop: `3px solid ${catColor}`,
              borderRight: `1px solid ${catColor}40`,
              borderBottom: `1px solid ${catColor}40`,
              borderLeft: `1px solid ${catColor}40`,
              boxShadow: dm
                ? "0 12px 40px rgba(0,0,0,0.6)"
                : "0 12px 40px rgba(0,0,0,0.18)",
              fontFamily: "'JetBrains Mono', monospace",
               borderRadius: isMobile ? "0" : "12px",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "14px 16px 10px",
              borderBottom: `1px solid ${catColor}22`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{
                  fontSize: 8, fontWeight: 700, color: catColor,
                  letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 3,
                }}>
                  {hotspot.category}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: dm ? "#f1f5f9" : "#1a2e1f" }}>
                  {hotspot.label}
                </div>
              </div>

              {/* Close button — visible */}
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 32, height: 32, flexShrink: 0,
                  background: dm ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
                  border: `1px solid ${dm ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.2)"}`,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: 18, lineHeight: 1,
                  color: dm ? "#f1f5f9" : "#1f2937",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  transition: "background 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = dm ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.2)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = dm ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)";
                }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: "14px 16px 16px", color: dm ? "#e2e8f0" : undefined }}>
              {renderContent(hotspot)}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
