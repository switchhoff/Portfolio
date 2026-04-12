"use client";

interface Props {
  color?: "cyan" | "green" | "orange";
  label?: string;
  pulse?: boolean;
}

const colorMap = {
  cyan:   "var(--cyan)",
  green:  "var(--green)",
  orange: "var(--orange)",
};

export default function LEDStatus({ color = "green", label, pulse = true }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        className={pulse ? "led" : ""}
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: colorMap[color],
          color: colorMap[color],
          flexShrink: 0,
        }}
      />
      {label && (
        <span className="readout" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
      )}
    </div>
  );
}
