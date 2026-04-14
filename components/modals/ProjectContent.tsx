import type { ProjectHotspot } from "@/lib/hotspots-config";

export default function ProjectContent({ hotspot }: { hotspot: ProjectHotspot }) {
  const p = hotspot.project;
  return (
    <div>
      <p style={{ fontSize: 12, color: "#5a7060", lineHeight: 1.8, marginBottom: 12 }}>
        {p.description}
      </p>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
        {p.tags.map(t => (
          <span key={t} style={{
            fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "2px 6px", border: "1px solid #dce5d6", color: "#9aaa94",
          }}>{t}</span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {p.repo && (
          <a href={`https://github.com/${p.repo}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 10, color: "#2d5a3d", textDecoration: "none", fontWeight: 500 }}>
            GitHub →
          </a>
        )}
        {p.link && (
          <a href={p.link} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 10, color: "#2d5a3d", textDecoration: "none", fontWeight: 500 }}>
            Visit →
          </a>
        )}
      </div>
    </div>
  );
}
