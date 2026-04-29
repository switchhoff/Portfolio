"use client";
import { useEffect, useRef, useState } from "react";

const SRC = "/audio/gns.mp3";
const FADE_MS = 800;
const DUCK_VOLUME = 0.08; // volume during other audio
const FULL_VOLUME = 0.35;

function fadeTo(audio: HTMLAudioElement, target: number, ms: number) {
  const start = audio.volume;
  const delta = target - start;
  const startTime = performance.now();
  function step() {
    const t = Math.min((performance.now() - startTime) / ms, 1);
    audio.volume = Math.max(0, Math.min(1, start + delta * t));
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export default function AmbientPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const playingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    const audio = new Audio(SRC);
    audio.loop = true;
    audio.volume = FULL_VOLUME;
    audioRef.current = audio;

    const onSaxStart = () => {
      if (audioRef.current && !audioRef.current.paused) {
        fadeTo(audioRef.current, DUCK_VOLUME, FADE_MS);
      }
    };
    const onSaxEnd = () => {
      if (audioRef.current && !audioRef.current.paused && playingRef.current) {
        fadeTo(audioRef.current, FULL_VOLUME, FADE_MS);
      }
    };

    window.addEventListener("sax-audio-start", onSaxStart);
    window.addEventListener("sax-audio-end", onSaxEnd);

    return () => {
      audio.pause();
      window.removeEventListener("sax-audio-start", onSaxStart);
      window.removeEventListener("sax-audio-end", onSaxEnd);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      fadeTo(audio, 0, FADE_MS);
      setTimeout(() => audio.pause(), FADE_MS);
      playingRef.current = false;
      setPlaying(false);
    } else {
      audio.volume = 0;
      audio.play();
      fadeTo(audio, FULL_VOLUME, FADE_MS);
      playingRef.current = true;
      setPlaying(true);
    }
  }

  if (!mounted) return null;

  return (
    <div style={{
      position: "absolute",
      left: "24%",
      top: "18%",
      transform: "rotate(-25deg)",
      transformOrigin: "left center",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      zIndex: 18,
      pointerEvents: "auto",
      whiteSpace: "nowrap",
    }}>
      <button
        onClick={toggle}
        title={playing ? "Stop ambiance" : "Play ambiance"}
        style={{
          width: 20, height: 20,
          border: "none",
          background: "transparent",
          color: "rgba(0,0,0,0.55)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          padding: 0,
          transition: "color 0.2s",
        }}
      >
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="4" height="12" rx="1" fill="rgba(0,0,0,0.6)"/>
            <rect x="10" y="2" width="4" height="12" rx="1" fill="rgba(0,0,0,0.6)"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 2.5C4 2.04 4.5 1.77 4.87 2.04L13.37 7.54C13.71 7.78 13.71 8.22 13.37 8.46L4.87 13.96C4.5 14.23 4 13.96 4 13.5V2.5Z" fill="rgba(0,0,0,0.6)"/>
          </svg>
        )}
      </button>
      <div style={{
        display: "flex",
        flexDirection: "row",
        gap: "6px",
      }}>
        <div style={{
          fontSize: "9px",
          fontFamily: "'JetBrains Mono', monospace",
          color: "rgba(0,0,0,0.55)",
          letterSpacing: "0.06em",
          fontWeight: 600,
        }}>
          Website Ambiance
        </div>
        <div style={{
          fontSize: "8px",
          fontFamily: "'JetBrains Mono', monospace",
          color: "rgba(0,0,0,0.4)",
          letterSpacing: "0.06em",
          fontStyle: "italic",
        }}>
          Going Nowhere Slowly — Seven Day Story
        </div>
      </div>
    </div>
  );
}
