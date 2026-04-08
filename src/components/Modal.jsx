const FONT = "'JetBrains Mono', monospace";
const ACCENT = "#96ea28";

export default function Modal({ data, onClose }) {
  if (!data) return null;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, fontFamily: FONT,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#0d0d0d", border: "1px solid #222",
        borderRadius: 6, padding: "28px 32px",
        minWidth: 320, maxWidth: 420, position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 16,
          background: "none", border: "none", color: "#444",
          fontSize: 18, cursor: "pointer", lineHeight: 1, fontFamily: FONT,
        }}>×</button>

        {data.mode === "country" ? <CountryView data={data} /> : <CoderView data={data} />}
      </div>
    </div>
  );
}

function CoderView({ data }) {
  return (
    <>
      <div style={{ fontSize: 11, color: ACCENT, marginBottom: 12 }}>
        root@yakutia:~$ cat {data.name.toLowerCase().replace(/\s/g, "-")}.json
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", marginBottom: 6 }}>
        {data.name}
      </div>
      <div style={{ width: 24, height: 1, background: ACCENT, marginBottom: 16, opacity: 0.4 }} />
      <div style={{ fontSize: 12, color: "#444", marginBottom: 6 }}>
        → location: <span style={{ color: "#888" }}>{data.location}</span>
      </div>
      {data.specialization && (
        <div style={{ fontSize: 12, color: "#444", marginBottom: 6 }}>
          → specialization: <span style={{ color: "#888" }}>{data.specialization}</span>
        </div>
      )}
      {data.company && (
        <div style={{ fontSize: 12, color: "#444", marginBottom: 16 }}>
          → company: <span style={{ color: "#888" }}>{data.company}</span>
        </div>
      )}
      {data.github?.trim() && data.github !== "#" && (
        <a href={data.github} target="_blank" rel="noreferrer" style={{
          display: "inline-block", fontSize: 12, color: ACCENT,
          textDecoration: "none", border: `1px solid ${ACCENT}`,
          borderRadius: 4, padding: "6px 14px", opacity: 0.85,
        }}>
          github →
        </a>
      )}
    </>
  );
}

function CountryView({ data }) {
  return (
    <>
      <div style={{ fontSize: 11, color: ACCENT, marginBottom: 12 }}>
        root@yakutia:~$ ls {data.countryName.toLowerCase().replace(/\s/g, "-")}/
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", marginBottom: 6 }}>
        {data.countryName}
      </div>
      <div style={{ fontSize: 11, color: "#444", marginBottom: 16 }}>
        {data.coders.length} developer{data.coders.length !== 1 ? "s" : ""} found_
      </div>
      <div style={{ width: 24, height: 1, background: ACCENT, marginBottom: 16, opacity: 0.4 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {data.coders.map((c) => (
          <div key={c.id}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginBottom: 3 }}>
              {c.name}
            </div>
            <div style={{ fontSize: 11, color: "#444", marginBottom: 3 }}>→ {c.location}</div>
            {c.specialization && (
              <div style={{ fontSize: 11, color: "#444", marginBottom: 3 }}>→ {c.specialization}</div>
            )}
            {c.company && (
              <div style={{ fontSize: 11, color: "#444", marginBottom: 4 }}>→ {c.company}</div>
            )}
            {c.github?.trim() && c.github !== "#" && (
              <a href={c.github} target="_blank" rel="noreferrer"
                style={{ fontSize: 11, color: ACCENT, textDecoration: "none", opacity: 0.85 }}>
                github →
              </a>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
