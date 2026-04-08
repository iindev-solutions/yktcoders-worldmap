import { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import versor from "versor";

const GLOBE_FILL = "#0d0d0d";
const COUNTRY_FILL = "#1e1e1e";
const COUNTRY_STROKE = "#3d3d3d";
const MARKER_FILL = "#96ea28";
const MARKER_HOVER = "#ffffff";

export default function GlobeMap({ coders, activeSpecs, onMarkerClick, onReady }) {
  const svgRef = useRef(null);

  const getVisible = (list) =>
    activeSpecs?.size ? list.filter((c) => activeSpecs.has(c.specialization)) : list;

  useEffect(() => {
    const W = window.innerWidth, H = window.innerHeight;
    let radius = Math.min(W, H) * 0.42;

    const svg = d3.select(svgRef.current).attr("width", W).attr("height", H);
    svg.selectAll("*").remove();

    // Звёзды
    const starCount = 250;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5,
      o: Math.random() * 0.6 + 0.2,
    }));
    const starsG = svg.append("g").attr("class", "stars");
    starsG.selectAll("circle").data(stars).enter().append("circle")
      .attr("cx", (d) => d.x).attr("cy", (d) => d.y)
      .attr("r", (d) => d.r).attr("fill", "#fff").attr("opacity", (d) => d.o);

    // Мерцание
    function twinkle() {
      starsG.selectAll("circle")
        .filter(() => Math.random() < 0.15)
        .transition().duration(400)
        .attr("opacity", 0.05)
        .attr("r", (d) => d.r * 0.5)
        .transition().duration(400)
        .attr("opacity", (d) => d.o)
        .attr("r", (d) => d.r);
    }
    const twinkleInterval = setInterval(twinkle, 500);

    const projection = d3.geoOrthographic()
      .scale(radius)
      .translate([W / 2, H / 2])
      .clipAngle(90)
      .rotate([60, -30]);

    const path = d3.geoPath().projection(projection);

    // Фон глобуса
    const bgCircle = svg.append("circle")
      .attr("cx", W / 2).attr("cy", H / 2).attr("r", radius)
      .attr("fill", GLOBE_FILL).attr("stroke", "#222").attr("stroke-width", 1);

    const g = svg.append("g");

    // Сетка
    const graticule = d3.geoGraticule()();
    const graticulePath = g.append("path")
      .datum(graticule).attr("fill", "none")
      .attr("stroke", "#1a1a1a").attr("stroke-width", 0.4);

    const countriesG = g.append("g");
    const markersG = g.append("g");

    // Outline поверх всего
    const outline = svg.append("path")
      .datum({ type: "Sphere" })
      .attr("fill", "none").attr("stroke", "#333").attr("stroke-width", 1);

    const redraw = () => {
      graticulePath.attr("d", path);
      countriesG.selectAll("path").attr("d", path);
      outline.attr("d", path);
      bgCircle.attr("r", projection.scale());

      markersG.selectAll(".marker").each(function(d) {
        const coords = d.coordinates || d;
        const p = projection(coords);
        if (!p) return;
        const r = projection.rotate();
        const [lon, lat] = coords;
        const dot =
          Math.sin((lat * Math.PI) / 180) * Math.sin((-r[1] * Math.PI) / 180) +
          Math.cos((lat * Math.PI) / 180) * Math.cos((-r[1] * Math.PI) / 180) *
          Math.cos(((lon + r[0]) * Math.PI) / 180);
        const el = d3.select(this);
        const isGroup = this.tagName === "g";
        if (isGroup) {
          el.attr("transform", `translate(${p[0]},${p[1]})`)
            .attr("visibility", dot > 0 ? "visible" : "hidden");
        } else {
          el.attr("cx", p[0]).attr("cy", p[1])
            .attr("visibility", dot > 0 ? "visible" : "hidden");
        }
      });
    };

    // Versor drag
    let v0, q0, r0;
    svg.call(
      d3.drag()
        .on("start", (event) => {
          const inv = projection.invert([event.x, event.y]);
          if (!inv) return;
          v0 = versor.cartesian(inv);
          r0 = projection.rotate();
          q0 = versor(r0);
        })
        .on("drag", (event) => {
          if (!v0) return;
          const inv = projection.rotate(r0).invert([event.x, event.y]);
          if (!inv) return;
          const v1 = versor.cartesian(inv);
          const q1 = versor.multiply(q0, versor.delta(v0, v1));
          projection.rotate(versor.rotation(q1));
          redraw();
        })
    );

    // Zoom — только масштаб, без translate
    svg.call(
      d3.zoom()
        .scaleExtent([0.5, 6])
        .on("zoom", (event) => {
          projection.scale(radius * event.transform.k);
          redraw();
        })
    );

    d3.json("/world-110m.json").then((world) => {
      const countries = topojson.feature(world, world.objects.countries).features
        .filter((d) => d.id !== "010");

      countriesG.selectAll("path").data(countries).enter().append("path")
        .attr("fill", COUNTRY_FILL).attr("stroke", COUNTRY_STROKE).attr("stroke-width", 0.4);

      const visible = getVisible(coders);

      // Группируем по координатам
      const cityGroups = {};
      visible.forEach((d) => {
        const key = `${d.coordinates[0]}_${d.coordinates[1]}`;
        if (!cityGroups[key]) cityGroups[key] = [];
        cityGroups[key].push(d);
      });
      const groups = Object.values(cityGroups);

      groups.forEach((group) => {
        const d = group[0];
        const isCluster = group.length > 1;

        if (isCluster) {
          const grp = markersG.append("g").attr("class", "marker")
            .datum({ coordinates: d.coordinates })
            .style("cursor", "pointer");

          grp.append("circle")
            .attr("r", 8).attr("fill", "#1a2e05")
            .attr("stroke", "#96ea28").attr("stroke-width", 1);

          grp.append("text")
            .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
            .attr("fill", "#96ea28").attr("font-size", "7px")
            .attr("font-family", "'JetBrains Mono', monospace")
            .attr("pointer-events", "none")
            .text(group.length);

          grp
            .on("mouseenter", () => {
              grp.select("circle").transition().duration(150)
                .attr("fill", "#2a4a0a").attr("stroke", "#ffffff");
            })
            .on("mouseleave", () => {
              grp.select("circle").transition().duration(150)
                .attr("fill", "#1a2e05").attr("stroke", "#96ea28");
            })
            .on("click", (event) => {
              event.stopPropagation();
              const city = group[0].city;
              const uniqueCities = [...new Set(group.map((c) => c.city))];
              onMarkerClick?.({ mode: "country", countryName: uniqueCities.join(", "), coders: group });
            });
        } else {
          markersG.append("circle")
            .attr("class", "marker").attr("r", 4)
            .attr("fill", MARKER_FILL).attr("stroke", "none")
            .style("cursor", "pointer")
            .datum(d)
            .on("mouseenter", (event) => {
              d3.select(event.currentTarget).attr("fill", MARKER_HOVER).attr("r", 6);
            })
            .on("mouseleave", (event) => {
              d3.select(event.currentTarget).attr("fill", MARKER_FILL).attr("r", 4);
            })
            .on("click", (event) => {
              event.stopPropagation();
              onMarkerClick?.(d);
            });
        }
      });

      redraw();
      onReady?.(projection, redraw);
    });

    const onResize = () => {
      const nW = window.innerWidth, nH = window.innerHeight;
      svg.attr("width", nW).attr("height", nH);
      projection.translate([nW / 2, nH / 2]);
      redraw();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearInterval(twinkleInterval);
    };
  }, [coders, activeSpecs]);

  return <svg ref={svgRef} style={{ display: "block", position: "absolute", inset: 0 }} />;
}
