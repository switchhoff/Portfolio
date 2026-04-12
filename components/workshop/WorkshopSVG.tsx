"use client";
import { useState } from "react";
import { hotspots, type Hotspot } from "@/lib/hotspots";

// ─────────────────────────────────────────────────────────────────────────────
// Isometric transform helpers — reverse-engineered from Icogram JSON geometry
// Canvas: 1280 × 640
//
// LW / RW (wall face): same parallelogram formula, semantics differ by side
//   pts: (x+wF,y), (x, y+wF/2), (x, y+hBB), (x+wF, y+hF)
//   hBB = hF + wF/2
//
// LP (floor, left-leaning diamond):
//   pts: (x+hF,y), (x+wBB, y+hF/2), (x+wF, y+hBB), (x, y+wF/2)
//   wBB = wF+hF,  hBB = wBB/2
//
// RP (floor, right-leaning):
//   pts: (x, y+hF/2), (x+hF, y), (x+wBB, y+wF/2), (x+wF, y+hBB)
// ─────────────────────────────────────────────────────────────────────────────

const W = (x: number, y: number, hBB: number, wF: number, hF: number) =>
  `${x + wF},${y} ${x},${y + wF / 2} ${x},${y + hBB} ${x + wF},${y + hF}`;

const LP = (x: number, y: number, wBB: number, hBB: number, wF: number, hF: number) =>
  `${x + hF},${y} ${x + wBB},${y + hF / 2} ${x + wF},${y + hBB} ${x},${y + wF / 2}`;

const RP = (x: number, y: number, wBB: number, hBB: number, wF: number, hF: number) =>
  `${x},${y + hF / 2} ${x + hF},${y} ${x + wBB},${y + wF / 2} ${x + wF},${y + hBB}`;

interface Props {
  onSelect: (h: Hotspot | null) => void;
  activeId: string | null;
}

export default function WorkshopSVG({ onSelect, activeId }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const hoveredSpot = hotspots.find(h => h.id === hoverId);

  return (
    <div
      style={{ position: "relative", width: "100%", maxWidth: 1280, margin: "0 auto" }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        setMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
    >
      <svg
        viewBox="0 0 1280 640"
        style={{ display: "block", width: "100%", height: "auto" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* ── Clip to canvas ── */}
          <clipPath id="canvas"><rect width="1280" height="640" /></clipPath>

          {/* ── Brick pattern ── */}
          <pattern id="brick" x="0" y="0" width="32" height="16" patternUnits="userSpaceOnUse">
            <rect width="32" height="16" fill="#4a1a08" />
            <rect x="1" y="1" width="28" height="6" fill="#6b2810" rx="0.5" />
            <rect x="17" y="9" width="14" height="6" fill="#6b2810" rx="0.5" />
            <rect x="1" y="9" width="13" height="6" fill="#6b2810" rx="0.5" />
          </pattern>

          {/* ── Multiboard tile pattern (11×11 octagon grid) ── */}
          <pattern id="mb" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#101828" />
            <polygon
              points="5,0 15,0 20,5 20,15 15,20 5,20 0,15 0,5"
              fill="#182238" stroke="#0a121e" strokeWidth="0.5"
            />
            <circle cx="10" cy="10" r="4" fill="#0c1620" />
            <circle cx="10" cy="10" r="2" fill="#090f18" />
          </pattern>

          {/* ── Concrete ── */}
          <pattern id="concrete" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="#c0c0c0" />
            <rect x="0" y="0" width="39" height="39" fill="#c8c8c8" />
            <line x1="0" y1="20" x2="40" y2="20" stroke="#b8b8b8" strokeWidth="0.5" />
            <line x1="20" y1="0" x2="20" y2="40" stroke="#b8b8b8" strokeWidth="0.5" />
          </pattern>

          {/* ── Green rug ── */}
          <pattern id="rug" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <rect width="24" height="24" fill="#3a6240" />
            <polyline points="0,12 6,6 12,12 18,6 24,12" fill="none" stroke="#4a7850" strokeWidth="1.5" />
            <polyline points="0,24 6,18 12,24 18,18 24,24" fill="none" stroke="#4a7850" strokeWidth="1.5" />
          </pattern>

          {/* ── Screen glow filter ── */}
          <filter id="screen-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#001840" floodOpacity="0.9" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* ── LED glow ── */}
          <filter id="led">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g clipPath="url(#canvas)">

          {/* ════════════════════════════════════════════════════════════════
              LAYER 1 — WALLS (brick, back of scene)
          ════════════════════════════════════════════════════════════════ */}

          {/* Left brick wall — id:20, LW, x:508 y:270 wBB:200 hBB:268 wF:200 hF:168 */}
          <polygon points={W(508, 270, 268, 200, 168)} fill="url(#brick)" />
          {/* Shade left wall */}
          <polygon points={W(508, 270, 268, 200, 168)} fill="rgba(0,0,0,0.35)" />

          {/* Right brick wall — id:19, RW, x:716 y:276 wBB:216 hBB:288 wF:216 hF:180 */}
          <polygon points={W(716, 276, 288, 216, 180)} fill="url(#brick)" />

          {/* ════════════════════════════════════════════════════════════════
              LAYER 2 — MULTIBOARD WALL PANELS (blue octagon grid)
          ════════════════════════════════════════════════════════════════ */}

          {/* Left wall multiboard — id:43+44, LW, x:532 y:276 wBB:176 hBB:128 wF:176 hF:40 */}
          <polygon points={W(532, 276, 128, 176, 40)} fill="url(#mb)" />
          <polygon points={W(532, 276, 128, 176, 40)} fill="rgba(30,50,90,0.25)" />
          <polygon points={W(532, 276, 128, 176, 40)} fill="none" stroke="#243858" strokeWidth="0.5" />

          {/* Left wall multiboard lower — id:41, LW, x:488 y:308 wBB:96 hBB:68 wF:96 hF:20 */}
          <polygon points={W(488, 308, 68, 96, 20)} fill="url(#mb)" />
          <polygon points={W(488, 308, 68, 96, 20)} fill="rgba(30,50,90,0.25)" />

          {/* Left wall multiboard upper — id:42, LW, x:572 y:266 wBB:80 hBB:60 wF:80 hF:20 */}
          <polygon points={W(572, 266, 60, 80, 20)} fill="url(#mb)" />
          <polygon points={W(572, 266, 60, 80, 20)} fill="rgba(30,50,90,0.25)" />

          {/* Right wall multiboard panel — id:40, RW, x:736 y:288 wBB:144 hBB:240 wF:144 hF:168 */}
          <polygon points={W(736, 288, 240, 144, 168)} fill="url(#mb)" />
          <polygon points={W(736, 288, 240, 144, 168)} fill="rgba(20,40,80,0.3)" />
          <polygon points={W(736, 288, 240, 144, 168)} fill="none" stroke="#1e3050" strokeWidth="1" />

          {/* Right wall blue frame/border — id:69, RW, x:736 y:208 wF:144 hF:8 */}
          <polygon points={W(736, 208, 80, 144, 8)} fill="#1F2E83" />
          {/* id:70 RW blue vertical strip — x:668 y:254 wF:8 hF:168 */}
          <polygon points={W(668, 254, 172, 8, 168)} fill="#1F2E83" />

          {/* ════════════════════════════════════════════════════════════════
              LAYER 3 — FLOOR
          ════════════════════════════════════════════════════════════════ */}

          {/* Concrete floor — id:21, LP, x:622 y:411 wBB:432 hBB:216 wF:192 hF:240 */}
          <polygon points={LP(622, 411, 432, 216, 192, 240)} fill="url(#concrete)" opacity="0.9" />
          <polygon points={LP(622, 411, 432, 216, 192, 240)} fill="rgba(0,0,0,0.2)" />

          {/* Stone strip — id:68, LP, x:730 y:373 wBB:188 hBB:94 wF:8 hF:180 */}
          <polygon points={LP(730, 373, 188, 94, 8, 180)} fill="#8a7055" opacity="0.7" />

          {/* Green rug — id:15, LP, x:654 y:415 wBB:324 hBB:162 wF:136 hF:188 */}
          <polygon points={LP(654, 415, 324, 162, 136, 188)} fill="url(#rug)" />
          <polygon points={LP(654, 415, 324, 162, 136, 188)} fill="rgba(0,0,0,0.15)" />

          {/* ════════════════════════════════════════════════════════════════
              LAYER 4 — WORKBENCH & DESK SURFACES
          ════════════════════════════════════════════════════════════════ */}

          {/* Workbench left face — id:18, RW (wood), x:464 y:370 wBB:48 hBB:60 wF:48 hF:36 */}
          <polygon points={W(464, 370, 60, 48, 36)} fill="#7a5530" />

          {/* Workbench top surface — id:34 LW (wood tan), x:528 y:358 wBB:88 hBB:84 wF:88 hF:40 */}
          <polygon points={W(528, 358, 84, 88, 40)} fill="#9a7045" />

          {/* Workbench right surface — id:33 LW, x:612 y:316 wBB:80 hBB:80 wF:80 hF:40 */}
          <polygon points={W(612, 316, 80, 80, 40)} fill="#8a6038" />

          {/* Desk top grey — id:103, LP, x:586 y:285 wBB:132 hBB:66 wF:96 hF:36 */}
          <polygon points={LP(586, 285, 132, 66, 96, 36)} fill="#8a8a8a" />
          <polygon points={LP(586, 285, 132, 66, 96, 36)} fill="rgba(0,0,0,0.2)" />

          {/* Desk top grey lower — id:104, LP, x:510 y:323 wBB:137 hBB:68 wF:97 hF:40 */}
          <polygon points={LP(510, 323, 137, 68, 97, 40)} fill="#7a7a7a" />
          <polygon points={LP(510, 323, 137, 68, 97, 40)} fill="rgba(0,0,0,0.25)" />

          {/* Computer desk surface — id:99, RP, x:702 y:333 wBB:108 hBB:54 wF:88 hF:20 */}
          <polygon points={RP(702, 333, 108, 54, 88, 20)} fill="#3C5B9B" />
          <polygon points={RP(702, 333, 108, 54, 88, 20)} fill="rgba(0,0,0,0.3)" />

          {/* ════════════════════════════════════════════════════════════════
              LAYER 5 — SHELVING UNIT (blue metal poles + shelves)
          ════════════════════════════════════════════════════════════════ */}

          {/* Shelf vertical poles — blue, using approximate iso positions */}
          {/* Front-left pole */}
          <rect x="424" y="330" width="6" height="110" fill="#1F2E83" />
          {/* Back-right pole */}
          <rect x="455" y="316" width="6" height="110" fill="#253590" />
          {/* Upper shelf pole */}
          <rect x="540" y="248" width="5" height="150" fill="#1F2E83" />
          <rect x="572" y="238" width="5" height="145" fill="#253590" />
          <rect x="634" y="218" width="5" height="130" fill="#1F2E83" />

          {/* Horizontal shelf boards */}
          {/* Top shelf */}
          <polygon
            points="432,245 625,190 634,192 440,248"
            fill="#2D3134" stroke="#1a2030" strokeWidth="0.5"
          />
          {/* Middle shelf */}
          <polygon
            points="430,300 620,248 630,250 440,302"
            fill="#252830" stroke="#1a2030" strokeWidth="0.5"
          />
          {/* Lower shelf (workbench level) */}
          <polygon
            points="428,355 618,302 628,305 438,358"
            fill="#2D3134" stroke="#1a2030" strokeWidth="0.5"
          />

          {/* Shelf items — boxes on top shelf */}
          <rect x="550" y="196" width="28" height="18" fill="#555" rx="1" />
          <rect x="582" y="190" width="22" height="22" fill="#666" rx="1" />
          {/* Bottles */}
          <rect x="600" y="200" width="6" height="22" fill="#2a7a3a" rx="1" />
          <rect x="592" y="204" width="5" height="18" fill="#8a5020" rx="1" />
          <rect x="585" y="202" width="5" height="20" fill="#3a6a9a" rx="1" />

          {/* Blue drawer units under workbench (kitchen cabinet tops) */}
          {/* id:25 x:576 y:368, id:30 x:544 y:384, id:31 x:496 y:408, id:32 x:464 y:424 */}
          {[
            { x: 570, y: 368 }, { x: 544, y: 382 }, { x: 498, y: 406 }, { x: 462, y: 422 }
          ].map((d, i) => (
            <rect key={i} x={d.x} y={d.y} width={22} height={30} fill="#1F2E83" rx="1" stroke="#152060" strokeWidth="0.5" />
          ))}

          {/* ════════════════════════════════════════════════════════════════
              LAYER 6 — WORKBENCH EQUIPMENT
          ════════════════════════════════════════════════════════════════ */}

          {/* Packing table (workbench back) — id:11, x:520 y:360 */}
          <rect x="522" y="362" width="60" height="44" fill="#9a7045" rx="1" />
          <rect x="522" y="362" width="60" height="5" fill="#7a5530" />

          {/* Packing table (workbench front) — id:9, x:440 y:400 */}
          <rect x="440" y="402" width="60" height="44" fill="#8a6038" rx="1" />
          <rect x="440" y="402" width="60" height="5" fill="#6a4828" />

          {/* 3D Printer — id:92, x:440 y:352 rendered ~80×80 */}
          {/* Frame */}
          <rect x="440" y="350" width="52" height="60" fill="#2D3134" rx="2" stroke="#1a1e24" strokeWidth="1" />
          {/* Print bed */}
          <rect x="446" y="374" width="40" height="28" fill="#1a1e24" rx="1" />
          {/* Arm */}
          <rect x="460" y="352" width="4" height="36" fill="#444" />
          <rect x="446" y="356" width="32" height="4" fill="#555" />
          {/* Print surface light */}
          <rect x="448" y="378" width="36" height="22" fill="#e8e8e8" opacity="0.08" />
          <circle cx="462" cy="355" r="2" fill="#00ff88" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.5s" repeatCount="indefinite" />
          </circle>

          {/* ════════════════════════════════════════════════════════════════
              LAYER 7 — NETWORKING (on left multiboard wall)
          ════════════════════════════════════════════════════════════════ */}

          {/* Network switch — id:71, x:600 y:264 */}
          <rect x="596" y="262" width="30" height="18" fill="#2D3134" rx="1" stroke="#1a2030" strokeWidth="0.5" />
          <rect x="598" y="264" width="26" height="14" fill="#1a1e26" rx="0.5" />
          {/* Port LEDs */}
          {[0, 1, 2, 3, 4].map(i => (
            <circle key={i} cx={600 + i * 5} cy="277" r="1.5" fill={i < 3 ? "#00ff88" : "#555"} filter="url(#led)">
              {i < 3 && <animate attributeName="opacity" values="1;0.3;1" dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite" />}
            </circle>
          ))}

          {/* Fibre splicer / power unit — id:73, x:560 y:288 */}
          <rect x="556" y="286" width="36" height="22" fill="#252830" rx="1" stroke="#1a2030" strokeWidth="0.5" />
          <rect x="558" y="290" width="10" height="10" fill="#1a1e24" rx="0.5" />
          <rect x="572" y="290" width="18" height="8" fill="#1a1e24" rx="0.5" />

          {/* Wall phone / hub — id:72, x:544 y:288 */}
          <rect x="540" y="286" width="16" height="24" fill="#2D3134" rx="1" />
          <rect x="542" y="288" width="12" height="16" fill="#1a1e24" rx="0.5" />

          {/* ════════════════════════════════════════════════════════════════
              LAYER 8 — COMPUTER DESK & MONITORS
          ════════════════════════════════════════════════════════════════ */}

          {/* Desk body — id:14, blue desk, x:640 y:416 */}
          <rect x="636" y="405" width="130" height="50" fill="#1F2E83" rx="1" stroke="#152060" strokeWidth="1" />
          {/* Desk drawer */}
          <rect x="638" y="415" width="60" height="20" fill="#152060" rx="1" />
          <rect x="638" y="438" width="60" height="14" fill="#152060" rx="1" />
          <rect x="666" y="423" width="8" height="3" fill="#2a3a9a" rx="1" />
          <rect x="666" y="441" width="8" height="3" fill="#2a3a9a" rx="1" />
          {/* PC tower under desk — id:51, x:744 y:416 */}
          <rect x="742" y="412" width="44" height="58" fill="#1a1e24" rx="2" stroke="#252830" strokeWidth="1" />
          <rect x="748" y="418" width="20" height="12" fill="#101418" rx="1" />
          <circle cx="755" cy="436" r="3" fill="#00d4ff" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
          </circle>
          <rect x="756" y="444" width="16" height="4" fill="#0a0e14" />

          {/* MONITOR STANDS */}
          {/* Left monitor stand */}
          <rect x="672" y="352" width="6" height="14" fill="#1a1e24" />
          <rect x="668" y="364" width="14" height="3" fill="#252830" rx="1" />
          {/* Centre monitor stand */}
          <rect x="704" y="368" width="7" height="12" fill="#1a1e24" />
          <rect x="700" y="378" width="15" height="3" fill="#252830" rx="1" />
          {/* Right monitor stand */}
          <rect x="752" y="384" width="6" height="12" fill="#1a1e24" />
          <rect x="748" y="394" width="14" height="3" fill="#252830" rx="1" />

          {/* LEFT MONITOR — id:95, x:672 y:312, rendered 32×48 */}
          <rect x="658" y="300" width="40" height="56" fill="#101418" rx="2" stroke="#252830" strokeWidth="1.5" />
          {/* Screen */}
          <rect x="661" y="303" width="34" height="46" fill="#010a14" rx="1" />
          {/* Code lines */}
          <line x1="664" y1="313" x2="690" y2="313" stroke="#00d4ff" strokeWidth="0.8" opacity="0.4" />
          <line x1="664" y1="320" x2="686" y2="320" stroke="#00ff88" strokeWidth="0.8" opacity="0.35" />
          <line x1="664" y1="327" x2="692" y2="327" stroke="#00d4ff" strokeWidth="0.8" opacity="0.3" />
          <line x1="664" y1="334" x2="684" y2="334" stroke="#00d4ff" strokeWidth="0.8" opacity="0.25" />
          <line x1="664" y1="341" x2="690" y2="341" stroke="#00ff88" strokeWidth="0.8" opacity="0.35" />
          <line x1="664" y1="348" x2="688" y2="348" stroke="#00d4ff" strokeWidth="0.8" opacity="0.2" />

          {/* CENTRE MONITOR (MAIN) — id:97, x:704 y:336, rendered 48×72 */}
          <rect x="698" y="296" width="56" height="80" fill="#101418" rx="2" stroke="#252830" strokeWidth="1.5" />
          <rect x="701" y="299" width="50" height="70" fill="#010a14" rx="1" />
          {/* Larger code window */}
          <line x1="705" y1="308" x2="746" y2="308" stroke="#00d4ff" strokeWidth="1" opacity="0.45" />
          <line x1="705" y1="318" x2="740" y2="318" stroke="#00ff88" strokeWidth="1" opacity="0.4" />
          <line x1="705" y1="328" x2="748" y2="328" stroke="#00d4ff" strokeWidth="1" opacity="0.35" />
          <line x1="705" y1="338" x2="742" y2="338" stroke="#ff6b35" strokeWidth="1" opacity="0.3" />
          <line x1="705" y1="348" x2="746" y2="348" stroke="#00d4ff" strokeWidth="1" opacity="0.35" />
          <line x1="705" y1="358" x2="740" y2="358" stroke="#00ff88" strokeWidth="1" opacity="0.4" />
          {/* Webcam dot */}
          <circle cx="727" cy="299" r="1.5" fill="#2a2e38" />
          <circle cx="727" cy="299" r="0.7" fill="#00d4ff" opacity="0.3" />

          {/* RIGHT MONITOR — id:94, x:752 y:352, rendered 32×48 */}
          <rect x="748" y="340" width="40" height="54" fill="#101418" rx="2" stroke="#252830" strokeWidth="1.5" />
          <rect x="751" y="343" width="34" height="44" fill="#010a14" rx="1" />
          <line x1="754" y1="352" x2="780" y2="352" stroke="#00d4ff" strokeWidth="0.8" opacity="0.35" />
          <line x1="754" y1="360" x2="778" y2="360" stroke="#ffcc44" strokeWidth="0.8" opacity="0.3" />
          <line x1="754" y1="368" x2="782" y2="368" stroke="#00d4ff" strokeWidth="0.8" opacity="0.25" />
          <line x1="754" y1="376" x2="776" y2="376" stroke="#00ff88" strokeWidth="0.8" opacity="0.3" />

          {/* KEYBOARD — id:96, x:664 y:344, rendered 48×36 */}
          <rect x="660" y="390" width="72" height="22" fill="#0d1018" rx="2" stroke="#1a1e28" strokeWidth="1" />
          <rect x="662" y="392" width="68" height="18" fill="#0a0d14" rx="1" />
          {/* Key rows */}
          {[0, 1, 2].map(row =>
            [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col => (
              <rect key={`${row}-${col}`}
                x={663 + col * 7.5} y={393 + row * 5.5}
                width="6" height="4" fill="#141820" rx="0.5"
              />
            ))
          )}

          {/* MOUSE — id:98, x:704 y:344 */}
          <ellipse cx="752" cy="395" rx="7" ry="10" fill="#0d1018" stroke="#1a1e28" strokeWidth="0.8" />
          <line x1="752" y1="389" x2="752" y2="398" stroke="#0a0d14" strokeWidth="0.5" />

          {/* ════════════════════════════════════════════════════════════════
              LAYER 9 — CHAIR
          ════════════════════════════════════════════════════════════════ */}

          {/* Chair — id:66, x:632 y:416, rendered 92×138 */}
          {/* Base / wheels */}
          <ellipse cx="678" cy="488" rx="28" ry="8" fill="#1a1e24" />
          {/* Wheel spokes */}
          {[0, 72, 144, 216, 288].map(angle => (
            <line key={angle}
              x1="678" y1="488"
              x2={678 + Math.cos(angle * Math.PI / 180) * 26}
              y2={488 + Math.sin(angle * Math.PI / 180) * 7}
              stroke="#252830" strokeWidth="3"
            />
          ))}
          {/* Gas cylinder */}
          <rect x="675" y="458" width="6" height="30" fill="#2a2e38" />
          {/* Seat */}
          <ellipse cx="678" cy="454" rx="30" ry="10" fill="#c49363" />
          <ellipse cx="678" cy="452" rx="28" ry="9" fill="#d4a878" />
          {/* Back support */}
          <rect x="672" y="400" width="8" height="52" fill="#2a2e38" />
          {/* Back rest */}
          <rect x="648" y="408" width="60" height="46" fill="#c49363" rx="4" stroke="#b48050" strokeWidth="1" />
          <rect x="651" y="411" width="54" height="40" fill="#d4a878" rx="3" />
          {/* Armrests */}
          <rect x="642" y="424" width="8" height="24" fill="#2D3134" rx="2" />
          <rect x="706" y="424" width="8" height="24" fill="#2D3134" rx="2" />

          {/* ════════════════════════════════════════════════════════════════
              LAYER 10 — LAMP
          ════════════════════════════════════════════════════════════════ */}

          {/* Floor lamp — id:39, x:416 y:408, rendered 32×112 */}
          {/* Pole */}
          <rect x="429" y="418" width="5" height="100" fill="#1a1e24" rx="1" />
          {/* Base */}
          <ellipse cx="431" cy="518" rx="16" ry="5" fill="#252830" />
          {/* Shade */}
          <polygon points="416,418 446,418 440,430 422,430" fill="#2a2e38" />
          <polygon points="418,420 444,420 438,430 424,430" fill="#3a3020" />
          {/* Warm glow */}
          <ellipse cx="431" cy="424" rx="12" ry="4" fill="#ffcc44" opacity="0.2">
            <animate attributeName="opacity" values="0.2;0.35;0.2" dur="4s" repeatCount="indefinite" />
          </ellipse>

          {/* ════════════════════════════════════════════════════════════════
              LAYER 11 — DOG (Easter egg!) — id:101, x:600 y:360
          ════════════════════════════════════════════════════════════════ */}

          {/* Dog body */}
          <ellipse cx="614" cy="386" rx="28" ry="18" fill="#d4a870" />
          <ellipse cx="600" cy="380" rx="18" ry="14" fill="#d4a870" />
          {/* Fluffy texture */}
          <ellipse cx="598" cy="374" rx="10" ry="7" fill="#e0b880" opacity="0.6" />
          <ellipse cx="614" cy="378" rx="8" ry="6" fill="#e0b880" opacity="0.5" />
          {/* Head */}
          <circle cx="588" cy="375" r="14" fill="#d4a870" />
          <circle cx="586" cy="373" r="11" fill="#e0b880" opacity="0.5" />
          {/* Ears */}
          <ellipse cx="580" cy="363" rx="6" ry="8" fill="#c89858" />
          <ellipse cx="597" cy="361" rx="5" ry="7" fill="#c89858" />
          {/* Eyes */}
          <circle cx="584" cy="372" r="3" fill="#1a1008" />
          <circle cx="594" cy="370" r="3" fill="#1a1008" />
          <circle cx="585" cy="371" r="1" fill="#fff" opacity="0.7" />
          <circle cx="595" cy="369" r="1" fill="#fff" opacity="0.7" />
          {/* Nose */}
          <ellipse cx="589" cy="378" rx="3" ry="2" fill="#0d0808" />
          {/* Paws */}
          <ellipse cx="598" cy="400" rx="8" ry="5" fill="#c89858" />
          <ellipse cx="626" cy="402" rx="8" ry="5" fill="#c89858" />
          {/* Cables near dog */}
          <path d="M 720,420 Q 680,440 640,460 Q 610,475 580,482" fill="none" stroke="#1a44aa" strokeWidth="3" opacity="0.7" />
          <path d="M 720,424 Q 680,445 640,465 Q 600,480 560,490" fill="none" stroke="#eee" strokeWidth="1.5" opacity="0.4" />

          {/* ════════════════════════════════════════════════════════════════
              LAYER 12 — CEILING DETAIL
          ════════════════════════════════════════════════════════════════ */}

          {/* Ceiling fill above the room interior */}
          <polygon points="508,270 716,276 716,208 508,202" fill="#0d1220" />
          {/* Strip light */}
          <rect x="560" y="210" width="120" height="5" rx="2" fill="#fffdf0" opacity="0.5" />
          <rect x="558" y="208" width="124" height="9" rx="3" fill="#fffdf0" opacity="0.06" />

          {/* ════════════════════════════════════════════════════════════════
              LAYER 13 — HOTSPOT OVERLAYS (interactive)
          ════════════════════════════════════════════════════════════════ */}

          {hotspots.map(h => {
            const isHover = hoverId === h.id;
            const isActive = activeId === h.id;
            const on = isHover || isActive;

            return (
              <g key={h.id}>
                <polygon
                  points={h.points}
                  fill={on ? h.color : "transparent"}
                  fillOpacity={on ? 0.12 : 0}
                  stroke={on ? h.color : "transparent"}
                  strokeWidth={isActive ? 1.5 : 1}
                  strokeOpacity={on ? 0.65 : 0}
                  style={{ cursor: "pointer", transition: "all 0.18s ease" }}
                  onMouseEnter={() => setHoverId(h.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => onSelect(isActive ? null : h)}
                />

                {/* Corner brackets on hover */}
                {on && (() => {
                  const pts = h.points.trim().split(/\s+/).map(p => {
                    const [px, py] = p.split(",").map(Number);
                    return { x: px, y: py };
                  });
                  const dirs = [[1,1],[-1,1],[1,-1],[-1,-1]];
                  return pts.slice(0,4).map((pt, i) => (
                    <g key={i}>
                      <line x1={pt.x} y1={pt.y} x2={pt.x + dirs[i][0]*14} y2={pt.y} stroke={h.color} strokeWidth="1.5" opacity="0.9"/>
                      <line x1={pt.x} y1={pt.y} x2={pt.x} y2={pt.y + dirs[i][1]*14} stroke={h.color} strokeWidth="1.5" opacity="0.9"/>
                    </g>
                  ));
                })()}

                {/* Zone label at centroid */}
                {on && (() => {
                  const pts = h.points.trim().split(/\s+/).map(p => {
                    const [px, py] = p.split(",").map(Number);
                    return { x: px, y: py };
                  });
                  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
                  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
                  const tw = h.label.length * 5.5 + 20;
                  return (
                    <g>
                      <rect x={cx - tw/2} y={cy - 14} width={tw} height={20} rx="2"
                        fill="rgba(6,9,13,0.9)" stroke={h.color} strokeWidth="0.6" strokeOpacity="0.5"/>
                      <text x={cx} y={cy + 1} textAnchor="middle" fontSize="9"
                        fontFamily="monospace" letterSpacing="1.2" fill={h.color}
                        style={{ textTransform: "uppercase" }}>
                        {h.label}
                      </text>
                    </g>
                  );
                })()}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating cursor tooltip */}
      {hoveredSpot && (
        <div style={{
          position: "absolute",
          left: mouse.x + 18, top: mouse.y - 10,
          background: "rgba(6,9,13,0.95)",
          border: `1px solid ${hoveredSpot.color}38`,
          padding: "5px 12px",
          pointerEvents: "none",
          fontFamily: "monospace",
          whiteSpace: "nowrap",
          backdropFilter: "blur(4px)",
          zIndex: 10,
        }}>
          <div style={{ fontSize: "10px", color: hoveredSpot.color, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {hoveredSpot.label}
          </div>
          <div style={{ fontSize: "9px", color: "#2a4050", letterSpacing: "0.08em", marginTop: "2px" }}>
            {hoveredSpot.sublabel}
          </div>
        </div>
      )}
    </div>
  );
}
