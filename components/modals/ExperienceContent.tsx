import type { ExperienceHotspot } from "@/lib/hotspots-config";

export default function ExperienceContent({ hotspot }: { hotspot: ExperienceHotspot }) {
  const e = hotspot.experience;
  return (
    <div>
      {e.media?.type === 'video' && (
        <div style={{ marginBottom: 12, borderRadius: 4, overflow: "hidden" }}>
          <video
            src={e.media.src}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", display: "block", maxHeight: 200, objectFit: "cover" }}
          />
        </div>
      )}
      {e.period && (
        <div style={{ fontSize: 9, color: "#9aaa94", letterSpacing: "0.1em", marginBottom: 4 }}>
          {e.period}
          {e.role && <> · {e.role}</>}
        </div>
      )}

      {e.description && (
        <p style={{ fontSize: 12, color: "#5a7060", lineHeight: 1.8, marginBottom: 12 }}>
          {e.description}
        </p>
      )}

      {e.items && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {e.items.map((item, i) => (
            <div key={i} style={{
              padding: "8px 12px",
              border: "1px solid #dce5d6",
              borderLeft: "2px solid #2d5a3d",
            }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#1a2e1f" }}>{item.degree}</div>
              {item.institution && <div style={{ fontSize: 9, color: "#9aaa94", marginTop: 2 }}>{item.institution}</div>}
              {item.note && <div style={{ fontSize: 9, color: "#b85c3a", marginTop: 1 }}>{item.note}</div>}
            </div>
          ))}
        </div>
      )}

      {e.tags && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10 }}>
          {e.tags.map(t => (
            <span key={t} style={{
              fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "2px 6px", border: "1px solid #dce5d6", color: "#9aaa94",
            }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
