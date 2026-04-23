"use client";
import { useRef, useState } from "react";
import type { PopupHotspot } from "@/lib/hotspots-config";

interface Song {
  name: string;
  audio: string;
  link: string;
}

function AudioButton({ song }: { song: Song }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function toggle() {
    if (playing) {
      audioRef.current?.pause();
      if (timerRef.current) clearTimeout(timerRef.current);
      setPlaying(false);
      return;
    }
    if (!audioRef.current) {
      audioRef.current = new Audio(song.audio);
      audioRef.current.onended = () => setPlaying(false);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setPlaying(true);
    timerRef.current = setTimeout(() => {
      audioRef.current?.pause();
      setPlaying(false);
    }, 10000);
  }

  return (
    <li style={{
      fontSize: 11, color: "#5a7060", padding: "6px 0",
      borderBottom: "1px solid #f0f4ec",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <button
        onClick={toggle}
        title={playing ? "Pause" : "Play 10s preview"}
        style={{
          width: 20, height: 20, borderRadius: "50%",
          border: "1px solid #dce5d6",
          background: playing ? "#2d5a3d" : "#f0f4ec",
          color: playing ? "#fff" : "#2d5a3d",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0, padding: 0,
          transition: "background 0.2s, color 0.2s",
        }}
      >
        {playing ? (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
            <rect x="1" y="1" width="2" height="6" rx="0.5"/>
            <rect x="5" y="1" width="2" height="6" rx="0.5"/>
          </svg>
        ) : (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
            <polygon points="2,1 7,4 2,7"/>
          </svg>
        )}
      </button>
      <a
        href={song.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#5a7060", textDecoration: "none" }}
        onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
        onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
      >
        {song.name}
      </a>
    </li>
  );
}

export default function PopupContent({ hotspot }: { hotspot: PopupHotspot }) {
  const songs: Song[] | undefined = (hotspot.popup as any).songs;

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#1a2e1f", marginBottom: 10 }}>
        {hotspot.popup.title}
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {hotspot.popup.items.map((item, i) => (
          <li key={i} style={{
            fontSize: 11, color: "#5a7060", padding: "6px 0",
            borderBottom: i < hotspot.popup.items.length - 1 || songs?.length ? "1px solid #f0f4ec" : "none",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#dce5d6", flexShrink: 0 }} />
            {item.name}
          </li>
        ))}
      </ul>

      {songs && songs.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#9aaa94", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            Favourite Songs
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {songs.map((song, i) => (
              <AudioButton key={i} song={song} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
