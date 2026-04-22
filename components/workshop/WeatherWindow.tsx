"use client";

import { useState, useEffect } from "react";

const LAT = -37.8136;
const LON = 144.9631;
const REFRESH_MS = 15 * 60 * 1000;

interface WeatherData {
  code: number;
  isDay: number;
  temp: number;
}

type Condition = "clear" | "cloudy" | "overcast" | "rain" | "snow" | "storm" | "fog";

function getCondition(code: number): Condition {
  if (code === 0) return "clear";
  if (code <= 3) return "cloudy";
  if (code <= 48) return "fog";
  if (code <= 67) return "rain";
  if (code <= 77) return "snow";
  if (code <= 82) return "rain";
  if (code >= 95) return "storm";
  return "cloudy";
}

// Exact polygon points from OffswitchBlocks.svg path 78 (upper pane)
const UPPER_PTS = "622.66,108.98 665.23,129.3 664.06,186.72 621.87,166.02";
// Exact polygon points from OffswitchBlocks.svg path 80 (lower pane)
const LOWER_PTS = "620.38,175.37 620.17,232.7 663.27,252.65 662.63,226.96 655.63,223.57 655.2,218.05 663.27,214.44 663.27,195.33";

// Frame color — dark wood to match scene
const FRAME_COLOR = "#1e1208";
const FRAME_W = 1.2;

// Fixed rain x offsets
const RAIN_X = [0, 5, 10, 15, 20, 25, 30, 35, 3, 13, 23, 33];

export function WeatherWindow() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const doFetch = async () => {
      try {
        const r = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=weather_code,temperature_2m,is_day&timezone=Australia%2FMelbourne`
        );
        const d = await r.json();
        setWeather({ code: d.current.weather_code, isDay: d.current.is_day, temp: Math.round(d.current.temperature_2m) });
      } catch { /* silent */ }
    };
    doFetch();
    const t = setInterval(doFetch, REFRESH_MS);
    return () => clearInterval(t);
  }, []);

  if (!weather) return null;

  const cond = getCondition(weather.code);
  const isDay = weather.isDay === 1;

  const SKY: Record<Condition, [string, string]> = {
    clear:    isDay ? ["#5bb8f5", "#a8d8f0"] : ["#0d1b3e", "#1a2a5e"],
    cloudy:   isDay ? ["#7a9cb0", "#b0c8d8"] : ["#1e2840", "#151e35"],
    overcast: isDay ? ["#6a7d8c", "#909fac"] : ["#161c28", "#101520"],
    rain:     isDay ? ["#4d6070", "#6a7f90"] : ["#0e131c", "#0a0f16"],
    snow:     isDay ? ["#b0c4d4", "#d0e0ec"] : ["#1a2030", "#141825"],
    storm:    ["#252530", "#181820"],
    fog:      isDay ? ["#a0b0bc", "#c4d0d8"] : ["#202530", "#181e28"],
  };
  const [skyTop, skyBot] = SKY[cond];

  // Sun/moon centre in upper pane (~midpoint of path 78)
  const cx = 643, cy = 143;
  // Rain start y
  const rainY = 158;

  return (
    <g style={{ pointerEvents: "none" }}>
      <defs>
        <clipPath id="ww-upper"><polygon points={UPPER_PTS} /></clipPath>
        <clipPath id="ww-lower"><polygon points={LOWER_PTS} /></clipPath>
        <linearGradient id="ww-sky" x1="0" y1="109" x2="0" y2="253"
          gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={skyTop} />
          <stop offset="100%" stopColor={skyBot} />
        </linearGradient>
      </defs>

      {/* ── Sky fill — exact window shapes ── */}
      <polygon points={UPPER_PTS} fill="url(#ww-sky)" />
      <polygon points={LOWER_PTS} fill="url(#ww-sky)" />

      {/* ── Sun or Moon ── */}
      <g clipPath="url(#ww-upper)">
        {isDay ? (
          <>
            <circle cx={cx} cy={cy} r={10} fill="#FFE066" opacity={cond === "clear" ? 0.3 : 0.1} />
            <circle cx={cx} cy={cy} r={6}  fill="#FFD700" opacity={cond === "clear" ? 1 : 0.45} />
            {cond === "clear" && [0,45,90,135,180,225,270,315].map(a => {
              const rad = (a * Math.PI) / 180;
              return (
                <line key={a}
                  x1={cx + Math.cos(rad) * 8.5} y1={cy + Math.sin(rad) * 8.5}
                  x2={cx + Math.cos(rad) * 12}  y2={cy + Math.sin(rad) * 12}
                  stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round"
                />
              );
            })}
          </>
        ) : (
          <g>
            <circle cx={cx} cy={cy}         r={5.5} fill="#DDE8C0" />
            <circle cx={cx + 3.5} cy={cy - 2} r={4.5} fill={skyTop} />
          </g>
        )}

        {/* Clouds */}
        {["cloudy","overcast","rain","storm","fog"].includes(cond) && (
          <g fill="white" opacity={cond === "overcast" || cond === "storm" ? 0.5 : cond === "fog" ? 0.45 : 0.8}>
            <ellipse cx={cx + 4}  cy={cy + 10} rx={9}   ry={4.5} />
            <ellipse cx={cx + 11} cy={cy + 8}  rx={6.5} ry={4}   />
            <ellipse cx={cx - 2}  cy={cy + 10} rx={6}   ry={3.5} />
            <ellipse cx={cx + 7}  cy={cy + 6}  rx={5}   ry={3.5} />
          </g>
        )}
      </g>

      {/* ── Rain ── */}
      {(cond === "rain" || cond === "storm") && <>
        <g clipPath="url(#ww-upper)">
          {RAIN_X.slice(0, 7).map((ox, i) => (
            <line key={i}
              x1={624 + ox} y1={rainY + (i % 3) * 6}
              x2={622 + ox} y2={rainY + (i % 3) * 6 + 7}
              stroke="#90b8d8" strokeWidth="0.8" opacity="0.7"
            />
          ))}
        </g>
        <g clipPath="url(#ww-lower)">
          {RAIN_X.map((ox, i) => (
            <line key={i}
              x1={622 + ox} y1={185 + (i % 4) * 12}
              x2={620 + ox} y2={185 + (i % 4) * 12 + 7}
              stroke="#90b8d8" strokeWidth="0.8" opacity="0.7"
            />
          ))}
        </g>
      </>}

      {/* ── Snow ── */}
      {cond === "snow" && (
        <g fill="white" opacity="0.9">
          {[0,8,16,24,32,4,12,20,28,36].map((ox, i) => (
            <circle key={i} cx={623 + ox} cy={155 + (i % 4) * 20} r={0.9} />
          ))}
        </g>
      )}

      {/* ── Window frame — rendered last so it sits on top of weather ── */}
      {/* Outer outline of upper pane */}
      <polygon points={UPPER_PTS} fill="none" stroke={FRAME_COLOR} strokeWidth={FRAME_W} />
      {/* Outer outline of lower pane */}
      <polygon points={LOWER_PTS} fill="none" stroke={FRAME_COLOR} strokeWidth={FRAME_W} />
      {/* Middle frame bar — bottom edge of upper pane */}
      <line x1="621.87" y1="166.02" x2="664.06" y2="186.72"
        stroke={FRAME_COLOR} strokeWidth={FRAME_W * 1.5} />
      {/* Middle frame bar — top edge of lower pane (path 80 closing edge) */}
      <line x1="620.38" y1="175.37" x2="663.27" y2="195.33"
        stroke={FRAME_COLOR} strokeWidth={FRAME_W * 1.5} />
    </g>
  );
}
