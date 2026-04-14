"use client";
import { useEffect, useState } from "react";
import type { StatusHotspot } from "@/lib/hotspots-config";

interface WeatherData {
  temp: string;
  condition: string;
  humidity: string;
  wind: string;
  feelsLike: string;
  bg: string;
}

function mapConditionToBg(
  main: string,
  icon: string,
  conditions?: Record<string, string>,
): string {
  const isNight = icon.endsWith("n");
  if (isNight) return conditions?.night || "#1a1a2e";
  const lower = main.toLowerCase();
  if (lower.includes("thunder")) return conditions?.stormy || "#2F4F4F";
  if (lower.includes("rain") || lower.includes("drizzle")) return conditions?.rainy || "#708090";
  if (lower.includes("cloud")) return conditions?.cloudy || "#B0C4DE";
  return conditions?.sunny || "#87CEEB";
}

export default function StatusContent({ hotspot }: { hotspot: StatusHotspot }) {
  const s = hotspot.status;
  const isWeather = s.location != null;

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(isWeather);

  useEffect(() => {
    if (!isWeather) return;
    const key = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
    if (!key) { setLoading(false); return; }

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Melbourne,AU&units=metric&appid=${key}`,
    )
      .then(r => r.json())
      .then(d => {
        setWeather({
          temp: `${Math.round(d.main.temp)}°C`,
          condition: d.weather[0].description,
          humidity: `${d.main.humidity}%`,
          wind: `${Math.round(d.wind.speed * 3.6)} km/h`,
          feelsLike: `${Math.round(d.main.feels_like)}°C`,
          bg: mapConditionToBg(d.weather[0].main, d.weather[0].icon, s.backgroundConditions),
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isWeather, s.backgroundConditions]);

  const fields = isWeather && weather
    ? [
        { label: "Temperature", value: weather.temp },
        { label: "Condition", value: weather.condition },
        { label: "Humidity", value: weather.humidity },
        { label: "Wind", value: weather.wind },
        { label: "Feels Like", value: weather.feelsLike },
      ]
    : s.fields;

  const bgColor = isWeather && weather ? weather.bg : undefined;

  return (
    <div>
      <p style={{ fontSize: 11, color: "#5a7060", lineHeight: 1.6, marginBottom: 10 }}>
        {s.description}
      </p>

      {loading && (
        <div style={{ fontSize: 10, color: "#9aaa94", padding: "8px 0" }}>Loading live data...</div>
      )}

      <div
        style={{
          display: "flex", flexDirection: "column", gap: 6,
          padding: bgColor ? 10 : 0,
          background: bgColor || "transparent",
          borderRadius: bgColor ? 4 : 0,
          transition: "background 0.3s",
        }}
      >
        {fields.map((f, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{
              fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
              color: bgColor ? "rgba(255,255,255,0.7)" : "#9aaa94",
            }}>
              {f.label}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: bgColor ? "#fff" : "#1a2e1f",
            }}>
              {f.value}
            </span>
          </div>
        ))}
      </div>

      {!isWeather && hotspot.note && (
        <div style={{ fontSize: 9, color: "#b85c3a", marginTop: 10, fontStyle: "italic" }}>
          {hotspot.note}
        </div>
      )}
    </div>
  );
}
