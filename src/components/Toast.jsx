import { useEffect, useState } from "react";

const FONT = "'JetBrains Mono', monospace";

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
      position: "fixed",
      bottom: 80,
      right: 32,
      background: "#111111",
      border: "1px solid #2a2a2a",
      borderRadius: 4,
      padding: "12px 18px",
      fontFamily: FONT,
      fontSize: 12,
      color: "#e0e0e0",
      zIndex: 300,
      transition: "opacity 0.3s",
      opacity: visible ? 1 : 0,
      boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
      maxWidth: 280,
    }}>
      <div style={{ color: "#888", fontSize: 10, marginBottom: 4 }}>
        system: operation complete_
      </div>
      {message}
    </div>
  );
}
