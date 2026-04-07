import { useEffect, useState } from "react";

const FONT = "'JetBrains Mono', monospace";
const ACCENT = "#96ea28";

export default function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: "fixed", bottom: 28, right: 32,
      background: "#0d0d0d", border: `1px solid ${ACCENT}`,
      borderRadius: 4, padding: "12px 18px",
      fontFamily: FONT, fontSize: 12, color: "#ffffff",
      zIndex: 300, transition: "opacity 0.3s",
      opacity: visible ? 1 : 0,
      maxWidth: 280,
    }}>
      <div style={{ color: ACCENT, fontSize: 10, marginBottom: 4 }}>
        system: operation complete_
      </div>
      {message}
    </div>
  );
}
