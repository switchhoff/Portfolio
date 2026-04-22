"use client";
import { useState, useRef, useEffect } from "react";
import { BLOCK_MAPPINGS, CATEGORY_COLORS } from "@/lib/svgBlockMappings";

const ITEM_TYPES = [
  { id: "projects", label: "Projects", color: "#FF6B6B" },
  { id: "experience", label: "Experience", color: "#4ECDC4" },
  { id: "education", label: "Education", color: "#45B7D1" },
  { id: "about", label: "About", color: "#FFA07A" },
  { id: "interests", label: "Interests", color: "#98D8C8" },
  { id: "generic", label: "Generic", color: "#CCCCCC" },
];

interface CategoryBlock {
  category: string;
  fillPath: number;
  strokePath: number;
}

export default function SVGVisualizer() {
  const [paths, setPaths] = useState<SVGPathElement[]>([]);
  const [blocks, setBlocks] = useState<CategoryBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<CategoryBlock | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const loadSVG = async () => {
      try {
        const res = await fetch("/OffswitchBlocks.svg");
        const svgText = await res.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");

        if (svgRef.current) {
          const rootSVG = svgDoc.documentElement as unknown as SVGSVGElement;
          if (rootSVG.viewBox.baseVal) {
            svgRef.current.setAttribute(
              "viewBox",
              `${rootSVG.viewBox.baseVal.x} ${rootSVG.viewBox.baseVal.y} ${rootSVG.viewBox.baseVal.width} ${rootSVG.viewBox.baseVal.height}`
            );
          }

          const pathElements = Array.from(
            svgDoc.querySelectorAll("path")
          ) as SVGPathElement[];

          const imageElements = Array.from(
            svgDoc.querySelectorAll("image")
          ) as SVGImageElement[];
          imageElements.forEach((img) => img.remove());

          pathElements.forEach((path) => {
            const clonedPath = path.cloneNode(true) as SVGPathElement;
            svgRef.current?.appendChild(clonedPath);
          });

          const visiblePaths = Array.from(
            svgRef.current.querySelectorAll("path")
          ) as SVGPathElement[];

          setPaths(visiblePaths);

          // Build blocks from mappings
          const allBlocks: CategoryBlock[] = [];
          Object.entries(BLOCK_MAPPINGS).forEach(([category, blockList]) => {
            blockList.forEach((block) => {
              allBlocks.push({
                category,
                fillPath: block.fillPath,
                strokePath: block.strokePath,
              });
            });
          });

          setBlocks(allBlocks);

          // Color all paths by category
          allBlocks.forEach((block) => {
            const color = CATEGORY_COLORS[block.category];
            const fillPath = visiblePaths[block.fillPath];
            const strokePath = visiblePaths[block.strokePath];

            if (fillPath) {
              fillPath.style.fill = `${color}40`; // 25% opacity
            }
            if (strokePath) {
              strokePath.style.stroke = color;
              strokePath.style.strokeWidth = "2.5";
            }
          });
        }
      } catch (err) {
        console.error("Failed to load SVG:", err);
      }
    };

    loadSVG();
  }, []);

  const handleBlockClick = (block: CategoryBlock) => {
    setSelectedBlock(block);
  };

  const categoryCount = Object.keys(BLOCK_MAPPINGS).length;
  const totalBlocks = blocks.length;

  return (
    <div className="w-full min-h-screen bg-black p-8">
      <div className="grid grid-cols-4 gap-8 h-full">
        {/* SVG Viewer */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-white text-2xl font-bold">OffswitchBlocks Mapped</h2>
          <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden h-[700px]">
            <svg
              ref={svgRef}
              viewBox="0 0 960 540"
              className="w-full h-full cursor-pointer"
            />
          </div>
          <div className="text-gray-400 text-sm">
            Total Blocks: <span className="text-white font-bold">{totalBlocks}</span> |
            Categories: <span className="text-white font-bold">{categoryCount}</span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-bold">Categories</h3>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-2">
            {ITEM_TYPES.map((type) => {
              const count = BLOCK_MAPPINGS[type.id as keyof typeof BLOCK_MAPPINGS]?.length || 0;
              return (
                <div
                  key={type.id}
                  className="flex items-center gap-3 p-2 rounded border-l-4"
                  style={{ borderColor: type.color }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: type.color }}
                  />
                  <div>
                    <p className="text-white font-bold text-sm">{type.label}</p>
                    <p className="text-gray-400 text-xs">{count} blocks</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Block Info */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-bold">Selected</h3>
          {selectedBlock ? (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
              <div
                className="p-3 rounded border-l-4"
                style={{ borderColor: CATEGORY_COLORS[selectedBlock.category] }}
              >
                <p className="text-gray-400 text-xs uppercase">Category</p>
                <p className="text-white font-bold text-lg capitalize">
                  {selectedBlock.category}
                </p>
              </div>

              <div className="bg-gray-800 p-3 rounded">
                <p className="text-gray-400 text-xs uppercase mb-1">Paths</p>
                <p className="text-gray-300 text-sm font-mono">
                  Fill: {selectedBlock.fillPath}
                </p>
                <p className="text-gray-300 text-sm font-mono">
                  Stroke: {selectedBlock.strokePath}
                </p>
              </div>

              <button
                onClick={() => setSelectedBlock(null)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Click a block to view details</p>
            </div>
          )}

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 space-y-1 text-xs text-gray-400">
            <p>Paths mapped: <span className="text-white">{totalBlocks * 2}</span></p>
            <p>All categories colored</p>
          </div>
        </div>
      </div>
    </div>
  );
}
