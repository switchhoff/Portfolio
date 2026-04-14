import type { AboutHotspot } from "@/lib/hotspots-config";

export default function AboutContent({ hotspot }: { hotspot: AboutHotspot }) {
  const a = hotspot.about;
  return (
    <div>
      <div style={{ fontSize: 11, color: "#9aaa94", letterSpacing: "0.08em", marginBottom: 6 }}>
        {a.tagline}
      </div>

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
        {a.tags.map(t => (
          <span key={t} style={{
            fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "2px 6px", border: "1px solid #dce5d6", color: "#9aaa94",
          }}>{t}</span>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "#5a7060", lineHeight: 1.8, whiteSpace: "pre-line", marginBottom: 14 }}>
        {a.bio}
      </p>

      <div style={{ display: "flex", gap: 10 }}>
        {a.links.map(l => (
          <a
            key={l.label}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 10, color: "#2d5a3d", textDecoration: "none", fontWeight: 500 }}
          >
            {l.label} →
          </a>
        ))}
      </div>
    </div>
  );
}
