"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { getHotspots, getCategoryColor, type Hotspot } from "@/lib/hotspots-config";

interface PointXY { x: number; y: number }

export default function PickerPage() {
  const allHotspots = getHotspots();
  const [selected, setSelected] = useState<string | null>(null);
  const [pointsMap, setPointsMap] = useState<Record<string, PointXY[]>>({});
  const [zoom, setZoom] = useState(0.5);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Load existing points from hotspots.json on mount
  useEffect(() => {
    const map: Record<string, PointXY[]> = {};
    allHotspots.forEach(h => {
      if (h.points && h.points.trim()) {
        map[h.id] = h.points.trim().split(/\s+/).map(p => {
          const [x, y] = p.split(",").map(Number);
          return { x, y };
        });
      }
    });
    setPointsMap(map);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const imgToScreen = useCallback((pt: PointXY) => ({
    x: pt.x * zoom + pan.x,
    y: pt.y * zoom + pan.y,
  }), [zoom, pan]);

  const screenToImg = useCallback((sx: number, sy: number) => ({
    x: Math.round((sx - pan.x) / zoom),
    y: Math.round((sy - pan.y) / zoom),
  }), [zoom, pan]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom * factor));
    setPan({
      x: mx - (mx - pan.x) * (newZoom / zoom),
      y: my - (my - pan.y) * (newZoom / zoom),
    });
    setZoom(newZoom);
  }, [zoom, pan]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!selected || dragging) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pt = screenToImg(e.clientX - rect.left, e.clientY - rect.top);
    setPointsMap(prev => ({
      ...prev,
      [selected]: [...(prev[selected] || []), pt],
    }));
  }, [selected, dragging, screenToImg]);

  const undoLast = useCallback(() => {
    if (!selected) return;
    setPointsMap(prev => {
      const pts = prev[selected] || [];
      return { ...prev, [selected]: pts.slice(0, -1) };
    });
  }, [selected]);

  const clearCurrent = useCallback(() => {
    if (!selected) return;
    setPointsMap(prev => ({ ...prev, [selected]: [] }));
  }, [selected]);

  const exportJSON = useCallback(() => {
    const updated = allHotspots.map(h => {
      const pts = pointsMap[h.id] || [];
      const pointsStr = pts.map(p => `${p.x},${p.y}`).join(" ");
      return { ...(h as any), points: pointsStr };
    });
    const blob = new Blob([JSON.stringify(updated, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hotspots.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [allHotspots, pointsMap]);

  const mappedCount = Object.values(pointsMap).filter(pts => pts.length >= 3).length;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'JetBrains Mono', monospace", background: "#1a1a2e" }}>
      {/* Sidebar */}
      <div style={{
        width: 280, background: "#16213e", borderRight: "1px solid #0f3460",
        overflowY: "auto", padding: "12px 0", flexShrink: 0,
      }}>
        <div style={{ padding: "0 12px 12px", borderBottom: "1px solid #0f3460" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e94560", marginBottom: 4 }}>
            Coordinate Picker
          </div>
          <div style={{ fontSize: 10, color: "#8899aa" }}>
            {mappedCount}/{allHotspots.length} mapped
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
            <button onClick={undoLast} style={btnStyle}>Undo</button>
            <button onClick={clearCurrent} style={btnStyle}>Clear</button>
            <button onClick={exportJSON} style={{ ...btnStyle, background: "#e94560", color: "#fff" }}>Export</button>
          </div>
        </div>

        {allHotspots.map(h => {
          const pts = pointsMap[h.id] || [];
          const hasPts = pts.length >= 3;
          const isSel = selected === h.id;
          return (
            <div
              key={h.id}
              onClick={() => setSelected(h.id)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                background: isSel ? "#0f3460" : "transparent",
                borderLeft: `3px solid ${isSel ? getCategoryColor(h.category) : "transparent"}`,
                transition: "all 0.1s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: hasPts ? "#3a9e5c" : "#555",
                }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: isSel ? "#fff" : "#aab", letterSpacing: "0.05em" }}>
                  {h.label}
                </span>
                <span style={{ fontSize: 8, color: getCategoryColor(h.category), marginLeft: "auto" }}>
                  {h.category}
                </span>
              </div>
              <div style={{ fontSize: 8, color: "#667", marginTop: 2, paddingLeft: 12 }}>
                {pts.length} pts — {h.svgElement}
              </div>
            </div>
          );
        })}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        style={{
          flex: 1, overflow: "hidden", position: "relative",
          cursor: dragging ? "grabbing" : selected ? "crosshair" : "default",
        }}
      >
        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src="/workshop.jpg"
            alt="Workshop"
            style={{ display: "block", imageRendering: "auto" }}
            draggable={false}
          />

          {/* Render all polygons */}
          <svg
            viewBox="0 0 2180 1952"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          >
            {allHotspots.map(h => {
              const pts = pointsMap[h.id] || [];
              if (pts.length < 2) return null;
              const catColor = getCategoryColor(h.category);
              const isSel = selected === h.id;
              const pointsStr = pts.map(p => `${p.x},${p.y}`).join(" ");

              return (
                <g key={h.id}>
                  {pts.length >= 3 && (
                    <polygon
                      points={pointsStr}
                      fill={catColor}
                      fillOpacity={isSel ? 0.25 : 0.1}
                      stroke={catColor}
                      strokeWidth={isSel ? 3 : 1.5}
                      strokeOpacity={0.8}
                    />
                  )}
                  {pts.length >= 2 && pts.length < 3 && (
                    <polyline
                      points={pointsStr}
                      fill="none"
                      stroke={catColor}
                      strokeWidth={2}
                      strokeDasharray="5,5"
                    />
                  )}
                  {isSel && pts.map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r={6} fill={catColor} stroke="#fff" strokeWidth={2} />
                  ))}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Zoom indicator */}
        <div style={{
          position: "absolute", bottom: 12, right: 12,
          background: "rgba(0,0,0,0.7)", color: "#aab", padding: "4px 10px",
          fontSize: 10, borderRadius: 4,
        }}>
          {Math.round(zoom * 100)}% · Alt+drag to pan · Scroll to zoom
        </div>

        {/* Selected indicator */}
        {selected && (
          <div style={{
            position: "absolute", top: 12, left: 12,
            background: getCategoryColor(allHotspots.find(h => h.id === selected)?.category || ""),
            color: "#fff", padding: "4px 12px", fontSize: 11, fontWeight: 600,
            borderRadius: 4, letterSpacing: "0.05em",
          }}>
            Mapping: {allHotspots.find(h => h.id === selected)?.label}
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "4px 10px", fontSize: 9, fontWeight: 600,
  background: "#0f3460", color: "#8899aa", border: "1px solid #1a3a6e",
  cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.05em",
};
