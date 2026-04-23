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
  const playingRef = useRef(false);

  useEffect(() => {
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

  return (
    <div style={{
      position: "absolute",
      left: "-2px",
      top: "42%",
      transform: "rotate(-35deg)",
      transformOrigin: "left center",
      display: "flex",
      alignItems: "center",
      gap: "7px",
      zIndex: 18,
      pointerEvents: "auto",
      whiteSpace: "nowrap",
    }}>
      <button
        onClick={toggle}
        title={playing ? "Stop ambiance" : "Play ambiance"}
        style={{
          width: 18, height: 18,
          borderRadius: "50%",
          border: "1px solid rgba(0,0,0,0.45)",
          background: playing ? "rgba(0,0,0,0.12)" : "transparent",
          color: "rgba(0,0,0,0.6)",
          cursor: "pointer",
          fontSize: "7px",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.2s",
        }}
      >
        {playing ? "■" : "▶"}
      </button>
      <span style={{
        fontSize: "9px",
        fontFamily: "'JetBrains Mono', monospace",
        color: "rgba(0,0,0,0.45)",
        letterSpacing: "0.06em",
        fontStyle: "italic",
      }}>
        Website Ambiance: Going Nowhere Slowly — Seven Day Story
      </span>
    </div>
  );
}
