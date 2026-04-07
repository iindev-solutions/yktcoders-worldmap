const FONT = "'JetBrains Mono', monospace";

// mode: "coder" | "country"
export default function Modal({ data, onClose }) {
  if (!data) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        fontFamily: FONT,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111111",
          border: "1px solid #2a2a2a",
          borderRadius: 6,
          padding: "28px 32px",
          minWidth: 320,
          maxWidth: 420,
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            background: "none",
            border: "none",
            color: "#555555",
            fontSize: 18,
            cursor: "pointer",
            lineHeight: 1,
            fontFamily: FONT,
          }}
        >
          ×
        </button>

        {data.mode === "country" ? (
          <CountryView data={data} />
        ) : (
          <CoderView data={data} />
        )}
      </div>
    </div>
  );
}

function CoderView({ data }) {
  return (
    <>
      <div style={{ fontSize: 11, color: "#555555", marginBottom: 12 }}>
        yakutia@russia:~$ cat {data.name.toLowerCase().replace(/\s/g, "-")}.json
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#e0e0e0", marginBottom: 6 }}>
        {data.name}
      </div>
      <div style={{ width: 24, height: 1, background: "#2a2a2a", marginBottom: 16 }} />
      <div style={{ fontSize: 12, color: "#555555", marginBottom: 6 }}>
        → location: <span style={{ color: "#aaaaaa" }}>{data.location}</span>
      </div>
      {data.specialization && (
        <div style={{ fontSize: 12, color: "#555555", marginBottom: 6 }}>
          → specialization: <span style={{ color: "#aaaaaa" }}>{data.specialization}</span>
        </div>
      )}
      {data.company && (
        <div style={{ fontSize: 12, color: "#555555", marginBottom: 16 }}>
          → company: <span style={{ color: "#aaaaaa" }}>{data.company}</span>
        </div>
      )}
      <a
        href={data.github}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "inline-block",
          fontSize: 12,
          color: "#e0e0e0",
          textDecoration: "none",
          border: "1px solid #2a2a2a",
          borderRadius: 4,
          padding: "6px 14px",
        }}
      >
        github →
      </a>
    </>
  );
}

function CountryView({ data }) {
  return (
    <>
      <div style={{ fontSize: 11, color: "#555555", marginBottom: 12 }}>
        yakutia@russia:~$ ls {data.countryName.toLowerCase().replace(/\s/g, "-")}/
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#e0e0e0", marginBottom: 6 }}>
        {data.countryName}
      </div>
      <div style={{ fontSize: 11, color: "#555555", marginBottom: 16 }}>
        {data.coders.length} developer{data.coders.length !== 1 ? "s" : ""} found_
      </div>
      <div style={{ width: 24, height: 1, background: "#2a2a2a", marginBottom: 16 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.coders.map((c) => (
          <div key={c.id}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0", marginBottom: 3 }}>
              {c.name}
            </div>
            <div style={{ fontSize: 11, color: "#555555", marginBottom: 3 }}>
              → {c.location}
            </div>
            {c.specialization && (
              <div style={{ fontSize: 11, color: "#555555", marginBottom: 3 }}>
                → {c.specialization}
              </div>
            )}
            {c.company && (
              <div style={{ fontSize: 11, color: "#555555", marginBottom: 4 }}>
                → {c.company}
              </div>
            )}
            <a
              href={c.github}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 11, color: "#aaaaaa", textDecoration: "none" }}
            >
              github →
            </a>
          </div>
        ))}
      </div>
    </>
  );
}
