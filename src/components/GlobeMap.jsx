import { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import versor from "versor";

const GLOBE_FILL = "#0d0d0d";
const COUNTRY_FILL = "#1e1e1e";
const COUNTRY_STROKE = "#3d3d3d";
const MARKER_FILL = "#96ea28";
const MARKER_HOVER = "#ffffff";

export default function GlobeMap({ coders, activeSpecs, onMarkerClick }) {
  const svgRef = useRef(null);

  const getVisible = (list) =>
    activeSpecs?.size ? list.filter((c) => activeSpecs.has(c.specialization)) : list;

  useEffect(() => {
    const W = window.innerWidth, H = window.innerHeight;
    let radius = Math.min(W, H) * 0.42;

    const svg = d3.select(svgRef.current).attr("width", W).attr("height", H);
    svg.selectAll("*").remove();

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
        const p = projection(d.coordinates);
        if (!p) return;
        // dot product — скрываем обратную сторону
        const r = projection.rotate();
        const [lon, lat] = d.coordinates;
        const dot =
          Math.sin((lat * Math.PI) / 180) * Math.sin((-r[1] * Math.PI) / 180) +
          Math.cos((lat * Math.PI) / 180) * Math.cos((-r[1] * Math.PI) / 180) *
          Math.cos(((lon + r[0]) * Math.PI) / 180);
        d3.select(this)
          .attr("cx", p[0]).attr("cy", p[1])
          .attr("visibility", dot > 0 ? "visible" : "hidden");
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
      markersG.selectAll(".marker").data(visible).enter().append("circle")
        .attr("class", "marker").attr("r", 4)
        .attr("fill", MARKER_FILL).attr("stroke", "none")
        .style("cursor", "pointer")
        .on("mouseenter", (event) => {
          d3.select(event.currentTarget).attr("fill", MARKER_HOVER).attr("r", 6);
        })
        .on("mouseleave", (event) => {
          d3.select(event.currentTarget).attr("fill", MARKER_FILL).attr("r", 4);
        })
        .on("click", (event, d) => {
          event.stopPropagation();
          onMarkerClick?.(d);
        });

      redraw();
    });

    const onResize = () => {
      const nW = window.innerWidth, nH = window.innerHeight;
      svg.attr("width", nW).attr("height", nH);
      projection.translate([nW / 2, nH / 2]);
      redraw();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [coders, activeSpecs]);

  return <svg ref={svgRef} style={{ display: "block", position: "absolute", inset: 0 }} />;
}
