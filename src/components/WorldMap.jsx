import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import Modal from "./Modal";
import RegisterModal from "./RegisterModal";
import Toast from "./Toast";
import { supabase } from "../lib/supabase";

const FONT = "'JetBrains Mono', monospace";
const BG = "#080808";
const COUNTRY_FILL = "#1e1e1e";
const COUNTRY_STROKE = "#2a2a2a";
const MARKER_FILL = "#96ea28";
const MARKER_HOVER = "#ffffff";
const TOOLTIP_BG = "#111111";
const TOOLTIP_BORDER = "#2a2a2a";
const TEXT_DIM = "#555555";
const TEXT_BRIGHT = "#ffffff";
const ACCENT = "#96ea28";

// Нормализуем строку из БД в формат приложения
const normalize = (c) => ({
  id: c.id,
  name: c.name,
  city: c.city,
  location: `${c.city}, ${c.country}`,
  countryId: c.country_id,
  coordinates: [c.lng, c.lat],
  github: c.github && c.github.trim() && c.github !== "#" ? c.github : null,
  specialization: c.specialization || "",
  company: c.company || "",
});

export default function WorldMap() {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [modal, setModal] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [toast, setToast] = useState(null);
  const [allCoders, setAllCoders] = useState([]);
  const allCodersRef = useRef([]);
  const codersByCountryRef = useRef({});
  const filteredCountriesRef = useRef([]);
  const tooltipRef = useRef(null);
  const mapReadyRef = useRef(false);
  const gRef = useRef(null);
  const projectionRef = useRef(null);
  const mapWidthRef = useRef(null);
  const svgNodeRef = useRef(null);

  const rebuildCodersByCountry = (codersList) => {
    const map = {};
    codersList.forEach((c) => {
      const country = filteredCountriesRef.current.find((f) =>
        d3.geoContains(f, c.coordinates)
      );
      if (!country) return;
      const key = String(parseInt(country.id));
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    codersByCountryRef.current = map;
  };

  // Загружаем кодеров из Supabase при старте
  useEffect(() => {
    supabase.from("coders").select("*").then(({ data, error }) => {
      if (error) { console.error(error); return; }
      if (data?.length) {
        const normalized = data.map(normalize);
        allCodersRef.current = normalized;
        rebuildCodersByCountry(normalized);
        setAllCoders(normalized);
      }
    });
  }, []);

  const drawMarkers = (codersList) => {
    const g = gRef.current;
    const projection = projectionRef.current;
    const mapWidth = mapWidthRef.current;
    const svg = d3.select(svgNodeRef.current);
    if (!g || !projection || !mapWidth) return;

    g.selectAll(".marker-group").remove();

    const cityGroups = {};
    codersList.forEach((d) => {
      const key = `${d.coordinates[0]}_${d.coordinates[1]}`;
      if (!cityGroups[key]) cityGroups[key] = [];
      cityGroups[key].push(d.id);
    });

    const jitter = {};
    Object.values(cityGroups).forEach((ids) => {
      if (ids.length === 1) {
        jitter[ids[0]] = { dx: 0, dy: 0 };
      } else {
        const spread = 4;
        ids.forEach((id, i) => {
          const angle = (2 * Math.PI * i) / ids.length;
          jitter[id] = { dx: Math.cos(angle) * spread, dy: Math.sin(angle) * spread };
        });
      }
    });

    const uniqueCities = codersList.filter(
      (d, i, arr) => arr.findIndex((c) => c.coordinates[0] === d.coordinates[0]) === i
    );

    [-1, 0, 1].forEach((offset) => {
      const mg = g.append("g")
        .attr("class", "marker-group")
        .attr("transform", `translate(${offset * mapWidth}, 0)`);

      mg.selectAll(".marker")
        .data(codersList)
        .enter()
        .append("circle")
        .attr("class", "marker")
        .attr("data-bx", (d) => projection(d.coordinates)[0])
        .attr("data-by", (d) => projection(d.coordinates)[1])
        .attr("data-dx", (d) => jitter[d.id]?.dx || 0)
        .attr("data-dy", (d) => jitter[d.id]?.dy || 0)
        .attr("cx", (d) => projection(d.coordinates)[0] + (jitter[d.id]?.dx || 0))
        .attr("cy", (d) => projection(d.coordinates)[1] + (jitter[d.id]?.dy || 0))
        .attr("r", 5)
        .attr("fill", MARKER_FILL)
        .attr("stroke", "none")
        .style("cursor", "pointer")
        .on("mouseenter", (event, d) => {
          const t = d3.zoomTransform(svg.node());
          g.selectAll(".marker")
            .filter((m) => m.id === d.id)
            .transition().duration(150)
            .attr("r", 8 / t.k)
            .attr("fill", MARKER_HOVER);
          tooltipRef.current = d;
          setTooltip({ x: event.clientX, y: event.clientY, data: d });
        })
        .on("mouseleave", () => {
          const t = d3.zoomTransform(svg.node());
          g.selectAll(".marker")
            .transition().duration(150)
            .attr("r", 5 / t.k)
            .attr("fill", MARKER_FILL);
          tooltipRef.current = null;
          setTooltip(null);
        })
        .on("click", (event, d) => {
          event.stopPropagation();
          setModal(d);
        });

      mg.selectAll(".city-label")
        .data(uniqueCities)
        .enter()
        .append("text")
        .attr("class", "city-label")
        .attr("x", (d) => projection(d.coordinates)[0] + 8)
        .attr("y", (d) => projection(d.coordinates)[1] + 1)
        .attr("fill", "#666666")
        .attr("font-size", "3.5px")
        .attr("font-family", FONT)
        .attr("dominant-baseline", "middle")
        .attr("pointer-events", "none")
        .text((d) => d.city);
    });
  };

  // Перерисовываем маркеры когда меняется список кодеров
  useEffect(() => {
    if (mapReadyRef.current) drawMarkers(allCoders);
  }, [allCoders]);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);
    svgNodeRef.current = svgRef.current;
    svg.selectAll("*").remove();

    const scale = width / 6.5;
    const mapWidth = scale * 2 * Math.PI;
    mapWidthRef.current = mapWidth;

    const projection = d3.geoEquirectangular().scale(scale).translate([width / 2, height / 2]);
    projectionRef.current = projection;

    const path = d3.geoPath().projection(projection);

    const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", (event) => {
      const t = event.transform;
      const scaledMapWidth = mapWidth * t.k;
      let tx = t.x % scaledMapWidth;
      if (tx > 0) tx -= scaledMapWidth;
      g.attr("transform", `translate(${tx},${t.y}) scale(${t.k})`);
      g.selectAll(".marker")
        .attr("r", 5 / t.k)
        .attr("cx", function() {
          return +d3.select(this).attr("data-bx") + (+d3.select(this).attr("data-dx")) / t.k;
        })
        .attr("cy", function() {
          return +d3.select(this).attr("data-by") + (+d3.select(this).attr("data-dy")) / t.k;
        });
    });

    svg.call(zoom);

    const g = svg.append("g");
    gRef.current = g;

    g.append("rect")
      .attr("width", width * 10).attr("height", height * 4)
      .attr("x", -width * 4).attr("y", -height).attr("fill", BG);

    d3.json("/world-110m.json").then((world) => {
      const countries = topojson.feature(world, world.objects.countries);
      const filteredCountries = countries.features.filter(
        (d) => d.id !== "010" && d3.geoArea(d) > 0.003
      );
      filteredCountriesRef.current = filteredCountries;

      d3.json("/country-names.json").then((names) => {
        const nameMap = {};
        names.forEach((n) => { nameMap[String(parseInt(n["country-code"]))] = n.name; });

        [-1, 0, 1].forEach((offset) => {
          const tileG = g.append("g").attr("transform", `translate(${offset * mapWidth}, 0)`);

          tileG.selectAll(".country")
            .data(filteredCountries)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", COUNTRY_FILL)
            .attr("stroke", COUNTRY_STROKE)
            .attr("stroke-width", 0.5)
            .on("mouseover", function (event, d) {
              if (!codersByCountryRef.current[String(parseInt(d.id))]) return;
              d3.select(this).transition().duration(150).attr("fill", "#333333");
            })
            .on("mouseout", function () {
              d3.select(this).transition().duration(300).attr("fill", COUNTRY_FILL);
            })
            .on("click", (event, d) => {
              const list = codersByCountryRef.current[String(parseInt(d.id))];
              if (!list) return;
              const countryName = nameMap[String(parseInt(d.id))] || "Unknown";
              setModal({ mode: "country", countryName, coders: list });
            })
            .style("cursor", (d) =>
              codersByCountryRef.current[String(parseInt(d.id))] ? "pointer" : "default"
            );

          tileG.selectAll(".country-label")
            .data(filteredCountries.filter((d) => d3.geoArea(d) > 0.004))
            .enter()
            .append("text")
            .attr("class", "country-label")
            .attr("x", (d) => path.centroid(d)[0])
            .attr("y", (d) => path.centroid(d)[1])
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "#3a3a3a")
            .attr("font-size", "3px")
            .attr("font-family", FONT)
            .attr("pointer-events", "none")
            .attr("letter-spacing", "0.3px")
            .text((d) => nameMap[String(parseInt(d.id))] || "");
        });

        mapReadyRef.current = true;
        drawMarkers(allCoders);
      });
    });

    const handleResize = () => svg.attr("width", window.innerWidth).attr("height", window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRegister = async (form) => {
    const { data, error } = await supabase.from("coders").insert([{
      name: form.name,
      city: form.city,
      country: form.country,
      specialization: form.specialization,
      company: form.company,
      github: form.github,
      lat: form.lat,
      lng: form.lng,
      country_id: null,
    }]).select().single();

    if (error) { console.error(error); return; }
    setAllCoders((prev) => {
      const updated = [...prev, normalize(data)];
      allCodersRef.current = updated;
      rebuildCodersByCountry(updated);
      return updated;
    });
    setToast(`→ ${data.name} added to the map.\n  location: ${data.city}, ${data.country}`);
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: BG }}>
      <svg ref={svgRef} style={{ display: "block" }} />

      <div style={{
        position: "absolute", top: 28, left: 36,
        fontFamily: FONT,
      }}>
        <div style={{ fontSize: 11, color: ACCENT, marginBottom: 6, pointerEvents: "none", userSelect: "none" }}>
          root@yakutia:~$ ./map --show coders
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: TEXT_BRIGHT, letterSpacing: "0.01em", pointerEvents: "none", userSelect: "none" }}>
          карта разработчиков из Якутии
        </div>
        <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 6, pointerEvents: "none", userSelect: "none" }}>
          {allCoders.length} developers found_
        </div>
        <button
          onClick={() => setShowRegister(true)}
          style={{
            marginTop: 14,
            display: "block",
            background: "none",
            border: `1px solid ${ACCENT}`,
            borderRadius: 4,
            padding: "7px 16px",
            color: ACCENT,
            fontFamily: FONT,
            fontSize: 11,
            cursor: "pointer",
            letterSpacing: "0.05em",
          }}
        >
          → отметиться на карте
        </button>
      </div>

      <Modal data={modal} onClose={() => setModal(null)} />

      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSubmit={handleRegister}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {tooltip && (
        <div style={{
          position: "absolute", left: tooltip.x + 14, top: tooltip.y - 10,
          background: TOOLTIP_BG, border: `1px solid #222`,
          borderRadius: 4, padding: "10px 14px", pointerEvents: "none",
          minWidth: 200, fontFamily: FONT, boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
        }}>
          <div style={{ fontSize: 11, color: ACCENT, marginBottom: 6 }}>
            root@yakutia:~$ whoami
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginBottom: 6 }}>
            {tooltip.data.name}
          </div>
          <div style={{ fontSize: 11, color: "#444", marginBottom: 3 }}>
            → {tooltip.data.location}
          </div>
          {tooltip.data.specialization && (
            <div style={{ fontSize: 11, color: "#444", marginBottom: 3 }}>
              → {tooltip.data.specialization}
            </div>
          )}
          {tooltip.data.company && (
            <div style={{ fontSize: 11, color: "#444", marginBottom: 8 }}>
              → {tooltip.data.company}
            </div>
          )}
          {tooltip.data.github && (
            <a href={tooltip.data.github} target="_blank" rel="noreferrer"
              style={{ fontSize: 11, color: ACCENT, textDecoration: "none", opacity: 0.85 }}>
              github →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
