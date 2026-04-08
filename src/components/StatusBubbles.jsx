import { useEffect, useState, useRef } from "react";

const FONT = "'JetBrains Mono', monospace";
const ACCENT = "#96ea28";

// Принимает coders с координатами уже в screen-space через getScreenPos
export default function StatusBubbles({ coders, getScreenPos }) {
  const [bubble, setBubble] = useState(null);
  const timerRef = useRef(null);
  const hideRef = useRef(null);

  useEffect(() => {
    const eligible = coders.filter((c) => c.status);
    if (!eligible.length) return;

    let idx = Math.floor(Math.random() * eligible.length);

    const show = () => {
      const coder = eligible[idx % eligible.length];
      idx++;

      const pos = getScreenPos(coder.coordinates);
      if (!pos) { timerRef.current = setTimeout(show, 2000); return; }

      setBubble({ coder, x: pos[0], y: pos[1] });

      // Скрываем через 3 сек
      hideRef.current = setTimeout(() => {
        setBubble(null);
        // Следующий через 2-4 сек
        timerRef.current = setTimeout(show, 2000 + Math.random() * 2000);
      }, 3000);
    };

    timerRef.current = setTimeout(show, 1500);

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(hideRef.current);
    };
  }, [coders]);

  if (!bubble) return null;

  const { coder, x, y } = bubble;
  const W = window.innerWidth;
  // Не вылезать за правый край
  const left = x + 12 + 180 > W ? x - 180 - 12 : x + 12;

  return (
    <div
      key={coder.id}
      style={{
        position: "absolute",
        left,
        top: y - 36,
        background: "#0d0d0d",
        border: `1px solid ${ACCENT}`,
        borderRadius: 6,
        padding: "6px 10px",
        fontFamily: FONT,
        fontSize: 12,
        color: "#fff",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        boxShadow: `0 0 12px rgba(150,234,40,0.15)`,
        animation: "bubblePop 0.2s ease",
        zIndex: 10,
      }}
    >
      <span style={{ fontSize: 10, color: ACCENT, marginRight: 6 }}>{coder.name.split(" ")[0]}</span>
      {coder.status}
      {/* Хвостик */}
      <div style={{
        position: "absolute",
        bottom: -5,
        left: left > x ? 12 : "auto",
        right: left < x ? 12 : "auto",
        width: 8, height: 8,
        background: "#0d0d0d",
        border: `1px solid ${ACCENT}`,
        borderTop: "none",
        borderLeft: left > x ? "none" : `1px solid ${ACCENT}`,
        borderRight: left > x ? `1px solid ${ACCENT}` : "none",
        transform: "rotate(45deg)",
      }} />
      <style>{`@keyframes bubblePop { from { opacity:0; transform:scale(0.8) } to { opacity:1; transform:scale(1) } }`}</style>
    </div>
  );
}
