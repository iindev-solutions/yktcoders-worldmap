import { useState, useEffect, useRef } from "react";

const FONT = "'JetBrains Mono', monospace";

function CitySearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  const handleSelect = (item) => {
    const city =
      item.address?.city ||
      item.address?.town ||
      item.address?.village ||
      item.address?.county ||
      item.display_name.split(",")[0];
    const country = item.address?.country || "";
    onSelect({ city, country, lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
    setQuery(city);
    setResults([]);
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>→ city</div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Start typing a city..."
        autoComplete="off"
        style={{
          width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
          borderRadius: 4, padding: "7px 10px", color: "#e0e0e0",
          fontFamily: FONT, fontSize: 12, outline: "none",
        }}
      />
      {loading && (
        <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>searching_</div>
      )}
      {results.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
          background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 4,
          marginTop: 2, overflow: "hidden",
        }}>
          {results.map((item) => (
            <div
              key={item.place_id}
              onClick={() => handleSelect(item)}
              style={{
                padding: "8px 10px", fontSize: 11, color: "#aaaaaa",
                cursor: "pointer", borderBottom: "1px solid #222",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#222"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {item.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RegisterModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", city: "", country: "", specialization: "", company: "", github: "", lat: null, lng: null });
  const [error, setError] = useState("");

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCitySelect = ({ city, country, lat, lng }) => {
    setForm((f) => ({ ...f, city, country, lat, lng }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.city || !form.lat || !form.lng) {
      setError("name and city are required_");
      return;
    }
    onSubmit(form);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 200, fontFamily: FONT,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111111", border: "1px solid #2a2a2a",
          borderRadius: 6, padding: "28px 32px", width: 380, position: "relative",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 16,
          background: "none", border: "none", color: "#555", fontSize: 18,
          cursor: "pointer", fontFamily: FONT,
        }}>×</button>

        <div style={{ fontSize: 11, color: "#555", marginBottom: 12 }}>
          yakutia@russia:~$ ./register --new-coder
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#e0e0e0", marginBottom: 4 }}>
          Отметиться на карте
        </div>
        <div style={{ width: 24, height: 1, background: "#2a2a2a", marginBottom: 20 }} />

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Имя */}
          <div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>→ name</div>
            <input
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              placeholder="Иван Иванов"
              style={{
                width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
                borderRadius: 4, padding: "7px 10px", color: "#e0e0e0",
                fontFamily: FONT, fontSize: 12, outline: "none",
              }}
            />
          </div>

          {/* Поиск города */}
          <CitySearch onSelect={handleCitySelect} />

          {/* Координаты — только для подтверждения */}
          {form.lat && (
            <div style={{ fontSize: 11, color: "#555" }}>
              → coordinates: <span style={{ color: "#3a3a3a" }}>{form.lat.toFixed(4)}, {form.lng.toFixed(4)}</span>
            </div>
          )}

          {/* Specialization */}
          <div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>→ specialization</div>
            <input
              value={form.specialization}
              onChange={(e) => set("specialization")(e.target.value)}
              placeholder="Frontend / Backend / DevOps"
              style={{
                width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
                borderRadius: 4, padding: "7px 10px", color: "#e0e0e0",
                fontFamily: FONT, fontSize: 12, outline: "none",
              }}
            />
          </div>

          {/* Company */}
          <div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>→ company</div>
            <input
              value={form.company}
              onChange={(e) => set("company")(e.target.value)}
              placeholder="Freelance / ACME Corp"
              style={{
                width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
                borderRadius: 4, padding: "7px 10px", color: "#e0e0e0",
                fontFamily: FONT, fontSize: 12, outline: "none",
              }}
            />
          </div>

          {/* GitHub */}
          <div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>→ github</div>
            <input
              value={form.github}
              onChange={(e) => set("github")(e.target.value)}
              placeholder="https://github.com/username"
              style={{
                width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
                borderRadius: 4, padding: "7px 10px", color: "#e0e0e0",
                fontFamily: FONT, fontSize: 12, outline: "none",
              }}
            />
          </div>

          {error && (
            <div style={{ fontSize: 11, color: "#888" }}>error: {error}</div>
          )}

          <button type="submit" style={{
            marginTop: 4, background: "#1e1e1e", border: "1px solid #3a3a3a",
            borderRadius: 4, padding: "8px 0", color: "#e0e0e0",
            fontFamily: FONT, fontSize: 12, cursor: "pointer",
          }}>
            → submit
          </button>
        </form>
      </div>
    </div>
  );
}
