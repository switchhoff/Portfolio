import type { PopupHotspot } from "@/lib/hotspots-config";

export default function PopupContent({ hotspot }: { hotspot: PopupHotspot }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#1a2e1f", marginBottom: 10 }}>
        {hotspot.popup.title}
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {hotspot.popup.items.map((item, i) => (
          <li key={i} style={{
            fontSize: 11, color: "#5a7060", padding: "6px 0",
            borderBottom: i < hotspot.popup.items.length - 1 ? "1px solid #f0f4ec" : "none",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#dce5d6", flexShrink: 0 }} />
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
