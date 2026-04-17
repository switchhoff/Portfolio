"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface PathMapping {
  index: number;
  itemType: "projects" | "experience" | "education" | "about" | "interests" | "generic" | null;
}

const ITEM_TYPES = [
  { id: "projects", label: "Projects", color: "#FF6B6B" },
  { id: "experience", label: "Experience", color: "#4ECDC4" },
  { id: "education", label: "Education", color: "#45B7D1" },
  { id: "about", label: "About", color: "#FFA07A" },
  { id: "interests", label: "Interests", color: "#98D8C8" },
  { id: "generic", label: "Generic", color: "#CCCCCC" },
];

export default function SVGVisualizer() {
  const [paths, setPaths] = useState<SVGPathElement[]>([]);
  const [mappings, setMappings] = useState<PathMapping[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svgDoc = svgRef.current;
    const pathElements = Array.from(
      svgDoc.querySelectorAll("path")
    ) as SVGPathElement[];

    setPaths(pathElements);
    setMappings(
      pathElements.map((_, i) => ({
        index: i,
        itemType: null,
      }))
    );
  }, []);

  const updateMapping = (index: number, itemType: typeof ITEM_TYPES[0]["id"] | null) => {
    setMappings((prev) =>
      prev.map((m) => (m.index === index ? { ...m, itemType: itemType as any } : m))
    );
  };

  const highlightPath = (index: number) => {
    if (index < 0 || index >= paths.length) return;
    const path = paths[index];
    path.style.stroke = "#FFD700";
    path.style.strokeWidth = "4";
  };

  const clearHighlight = (index: number) => {
    if (index < 0 || index >= paths.length) return;
    const path = paths[index];
    path.style.stroke = "";
    path.style.strokeWidth = "";
  };

  return (
    <div className="w-full min-h-screen bg-black p-8">
      <div className="grid grid-cols-3 gap-8 h-full">
        {/* SVG Viewer */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-white text-2xl font-bold">SVG Visualizer</h2>
          <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden h-[700px]">
            <svg
              ref={svgRef}
              viewBox="0 0 1920 1080"
              className="w-full h-full"
              style={{ background: "url(/OffswitchBKG.svg) center/contain no-repeat" }}
            >
              <image href="/OffswitchBKG.svg" width="1920" height="1080" />
              <image href="/OffswitchBlocks.svg" width="1920" height="1080" opacity="0.3" />
            </svg>
          </div>

          <div className="text-gray-400 text-sm">
            Total paths: <span className="text-white font-bold">{paths.length}</span> | Mapped:{" "}
            <span className="text-green-400 font-bold">
              {mappings.filter((m) => m.itemType).length}
            </span>
          </div>
        </div>

        {/* Path List & Mapping */}
        <div className="space-y-4">
          <h3 className="text-white text-xl font-bold">Path Mapping</h3>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-[700px] overflow-y-auto space-y-2">
            {mappings.map((mapping) => {
              const mapping_ = mappings[mapping.index];
              const itemType = ITEM_TYPES.find((t) => t.id === mapping_.itemType);

              return (
                <motion.div
                  key={mapping.index}
                  onMouseEnter={() => {
                    setHoveredIndex(mapping.index);
                    highlightPath(mapping.index);
                  }}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    clearHighlight(mapping.index);
                  }}
                  onClick={() => setSelectedIndex(mapping.index)}
                  className={`p-3 rounded border-2 cursor-pointer transition ${
                    selectedIndex === mapping.index
                      ? "border-yellow-400 bg-gray-800"
                      : hoveredIndex === mapping.index
                        ? "border-yellow-300 bg-gray-800"
                        : "border-gray-700 bg-gray-950"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-mono text-xs">Path {mapping.index}</span>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: itemType?.color || "#666" }}
                    />
                  </div>

                  {selectedIndex === mapping.index && (
                    <div className="mt-2 space-y-1 border-t border-gray-700 pt-2">
                      {ITEM_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateMapping(
                              mapping.index,
                              mapping_.itemType === type.id ? null : (type.id as any)
                            );
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-xs transition ${
                            mapping_.itemType === type.id
                              ? "bg-opacity-100 text-white"
                              : "bg-opacity-30 text-gray-400 hover:bg-opacity-50"
                          }`}
                          style={{
                            background: mapping_.itemType === type.id ? type.color : "#333",
                          }}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedIndex !== mapping.index && mapping_.itemType && (
                    <div className="text-xs text-gray-400 mt-1">{itemType?.label}</div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Export Mappings */}
          <button
            onClick={() => {
              const data = mappings
                .filter((m) => m.itemType)
                .reduce((acc, m) => {
                  if (!acc[m.itemType!]) acc[m.itemType!] = [];
                  acc[m.itemType!].push(m.index);
                  return acc;
                }, {} as Record<string, number[]>);

              console.log(JSON.stringify(data, null, 2));
              alert("Mappings logged to console");
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Export Mappings
          </button>
        </div>
      </div>
    </div>
  );
}
