import { useState, useEffect, useRef } from "react";

const FONT = "'JetBrains Mono', monospace";
const ACCENT = "#96ea28";

const inputStyle = {
  width: "100%", background: "#0d0d0d", border: "1px solid #222",
  borderRadius: 4, padding: "7px 10px", color: "#ffffff",
  fontFamily: FONT, fontSize: 12, outline: "none",
};

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
        setResults(await res.json());
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
  }, [query]);

  const handleSelect = (item) => {
    const city = item.address?.city || item.address?.town || item.address?.village || item.display_name.split(",")[0];
    onSelect({ city, country: item.address?.country || "", lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
    setQuery(city);
    setResults([]);
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ fontSize: 11, color: "#444", marginBottom: 4 }}>→ город *</div>
      <input value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Начните вводить город..." autoComplete="off" style={inputStyle} />
      {loading && <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>searching_</div>}
      {results.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
          background: "#0d0d0d", border: "1px solid #222", borderRadius: 4, marginTop: 2,
        }}>
          {results.map((item) => (
            <div key={item.place_id} onClick={() => handleSelect(item)}
              style={{ padding: "8px 10px", fontSize: 11, color: "#888", cursor: "pointer", borderBottom: "1px solid #1a1a1a" }}
              onMouseEnter={(e) => e.currentTarget.style.color = ACCENT}
              onMouseLeave={(e) => e.currentTarget.style.color = "#888"}
            >
              {item.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const REQUIRED = [
  { key: "name", label: "ФИО *", placeholder: "Иван Иванов" },
  { key: "specialization", label: "специализация *", placeholder: "Frontend / Backend / DevOps" },
];

const OPTIONAL_TEXT = [
  { key: "company", label: "компания", placeholder: "Freelance / ACME Corp" },
  { key: "status", label: "статус", placeholder: "Hello World! 👋" },
];

const OPTIONAL_LINKS = [
  { key: "github",   label: "github",   placeholder: "https://github.com/username" },
  { key: "telegram", label: "telegram", placeholder: "https://t.me/username" },
  { key: "linkedin", label: "linkedin", placeholder: "https://linkedin.com/in/username" },
  { key: "instagram",label: "instagram",placeholder: "https://instagram.com/username" },
  { key: "website",  label: "сайт",     placeholder: "https://example.com" },
];

export default function RegisterModal({ onClose, onSubmit, existingCoders = [] }) {
  const [form, setForm] = useState({
    name: "", specialization: "", company: "",
    github: "", telegram: "", linkedin: "", instagram: "", website: "",
    city: "", country: "", lat: null, lng: null,
  });
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("ФИО обязательно_"); return; }
    if (!form.specialization.trim()) { setError("специализация обязательна_"); return; }
    if (!form.city || !form.lat) { setError("город обязателен_"); return; }

    const isDuplicate = existingCoders.some(
      (c) => c.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
             c.city.trim().toLowerCase() === form.city.trim().toLowerCase()
    );
    if (isDuplicate) { setError(`уже есть: ${form.name} из ${form.city}_`); return; }

    onSubmit(form);
    onClose();
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, fontFamily: FONT,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#0d0d0d", border: "1px solid #222",
        borderRadius: 6, padding: "28px 32px", width: 380,
        position: "relative", maxHeight: "90vh", overflowY: "auto",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 16, background: "none",
          border: "none", color: "#444", fontSize: 18, cursor: "pointer", fontFamily: FONT,
        }}>×</button>

        <div style={{ fontSize: 11, color: ACCENT, marginBottom: 12 }}>
          root@yakutia:~$ ./register --new-coder
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>
          Отметиться на карте
        </div>
        <div style={{ width: 24, height: 1, background: ACCENT, marginBottom: 20, opacity: 0.4 }} />

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {REQUIRED.map(({ key, label, placeholder }) => (
            <div key={key}>
              <div style={{ fontSize: 11, color: "#444", marginBottom: 4 }}>→ {label}</div>
              <input value={form[key]} onChange={set(key)} placeholder={placeholder} style={inputStyle} />
            </div>
          ))}

          <CitySearch onSelect={({ city, country, lat, lng }) =>
            setForm((f) => ({ ...f, city, country, lat, lng }))
          } />

          {form.lat && (
            <div style={{ fontSize: 11, color: "#333" }}>
              → {form.city}, {form.country} ({form.lat.toFixed(4)}, {form.lng.toFixed(4)})
            </div>
          )}

          {OPTIONAL_TEXT.map(({ key, label, placeholder }) => (
            <div key={key}>
              <div style={{ fontSize: 11, color: "#444", marginBottom: 4 }}>→ {label}</div>
              <input value={form[key]} onChange={set(key)} placeholder={placeholder} style={inputStyle} />
            </div>
          ))}

          <div style={{ width: 24, height: 1, background: "#222", marginTop: 4 }} />
          <div style={{ fontSize: 11, color: "#333" }}>→ ссылки (опционально)</div>

          {OPTIONAL_LINKS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <div style={{ fontSize: 11, color: "#444", marginBottom: 4 }}>→ {label}</div>
              <input value={form[key]} onChange={set(key)} placeholder={placeholder} style={inputStyle} />
            </div>
          ))}

          {error && <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>error: {error}</div>}

          <button type="submit" style={{
            marginTop: 4, background: "none", border: `1px solid ${ACCENT}`,
            borderRadius: 4, padding: "8px 0", color: ACCENT,
            fontFamily: FONT, fontSize: 12, cursor: "pointer",
          }}>
            → submit
          </button>
        </form>
      </div>
    </div>
  );
}
