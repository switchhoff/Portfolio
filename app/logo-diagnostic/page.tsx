"use client";

import React, { useState, useEffect } from "react";
import OffswitchLogo from "@/components/OffswitchLogo";

/**
 * LOGO DIAGNOSTIC PAGE
 * 
 * Iterates through every SVG path one-by-one to create a visual reference map.
 */

export default function LogoDiagnostic() {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const totalPaths = 124; // Range of IDs observed

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && index < totalPaths) {
      interval = setInterval(() => {
        setIndex((prev) => (prev >= totalPaths ? 0 : prev + 1));
      }, 300); // 0.3s per path
    }
    return () => clearInterval(interval);
  }, [isPlaying, index]);

  return (
    <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center justify-center font-mono">
      <div className="absolute top-10 left-10 text-red-500 text-xl font-bold">
        LOGO_MAPPER_V1.0
      </div>

      <div className="mb-8 flex flex-col items-center">
        <div className="text-6xl mb-2">PATH ID: {index}</div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-6 py-2 border border-white hover:bg-white hover:text-black transition-colors"
          >
            {isPlaying ? "PAUSE" : "START SEQUENCE"}
          </button>
          <button 
            onClick={() => setIndex(0)}
            className="px-6 py-2 border border-white hover:bg-white hover:text-black transition-colors"
          >
            RESET
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-4xl border border-zinc-800 bg-zinc-950/50 aspect-video flex items-center justify-center rounded-lg overflow-hidden">
        {/* We inject a custom version of the SVG or just highlight the specific path */}
        <DiagnosticLogo activeId={index} />
      </div>

      <div className="mt-8 text-zinc-500 text-xs text-center max-w-xl">
        Scanning all 114 original SVG paths. The system highlights each segment in bright red while displaying its internal path ID for architectural mapping.
      </div>
    </div>
  );
}

// Minimal logo renderer that only shows the active path
function DiagnosticLogo({ activeId }: { activeId: number }) {
  const p = getOriginalPath(activeId);
  if (!p) return <div className="text-zinc-700 italic">No path data for ID {activeId}</div>;

  return (
    <svg viewBox="0 0 960 540" className="w-full h-full">
      <path d="m0 0l960 0l0 540l-960 0z" fill="#050505" />
      <path
        d={p.d}
        fill={p.fill === "#000000" ? "#ff0000" : p.fill || "#ff0000"}
        stroke={p.stroke === "#000000" ? "#ff0000" : p.stroke || "#ff0000"}
        strokeWidth={p.strokeWidth || 2}
        className="animate-pulse"
      />
      {/* Ghost original for context */}
      <motion_ghost d={p.d} />
    </svg>
  );
}

function motion_ghost({ d }: { d: string }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="#ffffff"
      strokeWidth={1}
      opacity={0.05}
    />
  );
}
