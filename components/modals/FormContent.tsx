"use client";
import { useState } from "react";
import type { FormHotspot } from "@/lib/hotspots-config";

export default function FormContent({ hotspot }: { hotspot: FormHotspot }) {
  const f = hotspot.form;
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const formData = new FormData(e.currentTarget);
    const id = process.env.NEXT_PUBLIC_FORMSPREE_ID;
    if (!id) { setStatus("error"); return; }
    try {
      const res = await fetch(`https://formspree.io/f/${id}`, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#2d5a3d", marginBottom: 4 }}>Sent!</div>
        <div style={{ fontSize: 11, color: "#9aaa94" }}>Thanks for reaching out.</div>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 11, color: "#5a7060", lineHeight: 1.6, marginBottom: 12 }}>
        {f.description}
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {f.fields.map(field => (
          <div key={field.name}>
            <label style={{ fontSize: 9, color: "#9aaa94", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                required={field.required}
                rows={3}
                style={inputStyle}
              />
            ) : (
              <input
                name={field.name}
                type={field.type}
                required={field.required}
                style={inputStyle}
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          disabled={status === "sending"}
          style={{
            marginTop: 4, padding: "8px 0",
            fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
            color: "#fff", background: status === "sending" ? "#9aaa94" : "#2d5a3d",
            border: "none", cursor: status === "sending" ? "wait" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {status === "sending" ? "Sending..." : "Send Message"}
        </button>
        {status === "error" && (
          <div style={{ fontSize: 9, color: "#b85c3a" }}>Something went wrong. Try again.</div>
        )}
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", marginTop: 2, padding: "6px 8px",
  fontSize: 11, color: "#1a2e1f", fontFamily: "inherit",
  background: "#f8faf6", border: "1px solid #dce5d6",
  outline: "none", boxSizing: "border-box",
};
