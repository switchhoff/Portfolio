import type { LinkHotspot } from "@/lib/hotspots-config";

export default function LinkContent({ hotspot }: { hotspot: LinkHotspot }) {
  const l = hotspot.link;
  return (
    <div>
      <p style={{ fontSize: 12, color: "#5a7060", lineHeight: 1.8, marginBottom: 14 }}>
        {l.description}
      </p>
      <a
        href={l.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          fontSize: 10, fontWeight: 600, color: "#fff",
          background: "#2d5a3d", padding: "6px 14px",
          textDecoration: "none", letterSpacing: "0.08em",
          transition: "background 0.15s",
        }}
      >
        {l.text} →
      </a>
    </div>
  );
}
