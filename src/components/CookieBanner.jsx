import { useState } from "react";

const FONT = "'JetBrains Mono', monospace";
const ACCENT = "#96ea28";

export default function CookieBanner() {
  const [visible, setVisible] = useState(
    () => !localStorage.getItem("cookieAccepted")
  );

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem("cookieAccepted", "1");
    setVisible(false);
  };

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      background: "#0d0d0d", border: "1px solid #222", borderRadius: 6,
      padding: "14px 20px", fontFamily: FONT, fontSize: 11,
      display: "flex", alignItems: "center", gap: 16,
      zIndex: 1000, boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
      maxWidth: "90vw",
    }}>
      <span style={{ color: "#555" }}>
        мы используем cookies для корректной работы сайта
      </span>
      <button onClick={accept} style={{
        background: "none", border: `1px solid ${ACCENT}`,
        borderRadius: 4, padding: "4px 12px", color: ACCENT,
        fontFamily: FONT, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap",
      }}>
        → понятно
      </button>
    </div>
  );
}
