const FONT = "'JetBrains Mono', monospace";
const ACCENT = "#96ea28";

const ICONS = {
  github: (
    <svg width="14" height="14" viewBox="0 0 19 19" fill="currentColor">
      <path fillRule="evenodd" d="M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844" clipRule="evenodd"/>
    </svg>
  ),
  telegram: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.5l-2.95-.924c-.64-.203-.658-.64.136-.954l11.57-4.461c.537-.194 1.006.131.968.96z"/>
    </svg>
  ),
  linkedin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  instagram: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  ),
  website: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
};

const LINK_LABELS = {
  github: "github",
  telegram: "telegram",
  linkedin: "linkedin",
  instagram: "instagram",
  website: "сайт",
};

function Links({ data }) {
  const links = Object.entries(LINK_LABELS).filter(([key]) => data[key]?.trim());
  if (!links.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
      {links.map(([key, label]) => (
        <a key={key} href={data[key]} target="_blank" rel="noreferrer" style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 11, color: ACCENT, textDecoration: "none", opacity: 0.85,
        }}>
          {ICONS[key]}
          {label}
        </a>
      ))}
    </div>
  );
}

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
        maxHeight: "85vh", overflowY: "auto",
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
        → город: <span style={{ color: "#888" }}>{data.location}</span>
      </div>
      {data.specialization && (
        <div style={{ fontSize: 12, color: "#444", marginBottom: 6 }}>
          → специализация: <span style={{ color: "#888" }}>{data.specialization}</span>
        </div>
      )}
      {data.company && (
        <div style={{ fontSize: 12, color: "#444", marginBottom: 6 }}>
          → компания: <span style={{ color: "#888" }}>{data.company}</span>
        </div>
      )}
      <Links data={data} />
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
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: 360, overflowY: "auto", paddingRight: 4 }}>
        {data.coders.map((c) => (
          <div key={c.id}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginBottom: 3 }}>{c.name}</div>
            <div style={{ fontSize: 11, color: "#444", marginBottom: 2 }}>→ {c.location}</div>
            {c.specialization && <div style={{ fontSize: 11, color: "#444", marginBottom: 2 }}>→ {c.specialization}</div>}
            {c.company && <div style={{ fontSize: 11, color: "#444", marginBottom: 2 }}>→ {c.company}</div>}
            <Links data={c} />
          </div>
        ))}
      </div>
    </>
  );
}
