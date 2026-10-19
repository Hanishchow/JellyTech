"use client";

import { StampsPile } from "@/components/ui/stamps-pile";

export function StampsPage() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#08071a", overflow: "hidden", userSelect: "none" }}>
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(80,20,160,0.14) 0%, transparent 70%)", top: -200, left: -200, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(40,8,110,0.10) 0%, transparent 70%)", bottom: -120, right: -120, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "22px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 50, pointerEvents: "none" }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: "0.26em", color: "rgba(200,180,255,0.38)", textTransform: "uppercase" }}>
          JELLYTECH
        </div>
        <div style={{ fontSize: 9, letterSpacing: "0.07em", color: "rgba(140,120,180,0.3)", textAlign: "right", lineHeight: 1.7, fontFamily: "'Space Mono',monospace" }}>
          hover to reveal<br />click to explore
        </div>
      </div>

      <div style={{ position: "absolute", inset: "60px 0 0 0" }}>
        <StampsPile />
      </div>
    </div>
  );
}
