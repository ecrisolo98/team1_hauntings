import define1 from "./viz1scrubber.js";

function _chart(d3, topojson, us, data, Scrubber) {
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, 960, 600]);

  svg.append("path")
    .datum(topojson.merge(us, us.objects.lower48.geometries))
    .attr("fill", "#ddd")
    .attr("d", d3.geoPath());

  svg.append("path")
    .datum(topojson.mesh(us, us.objects.lower48, (a, b) => a !== b))
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-linejoin", "round")
    .attr("d", d3.geoPath());

  const g = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "black");

  const dot = g.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("transform", d => `translate(${d})`);

  svg.append("circle")
    .attr("fill", "blue")
    .attr("transform", `translate(${data[0]})`)
    .attr("r", 3);

  let previousDate = -Infinity;

  // Create wrapper
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "flex-start";
  wrapper.style.maxWidth = "960px";
  wrapper.style.margin = "0 auto";

  // Create and style Scrubber
  const scrubber = Scrubber(
    d3.utcWeek.every(2).range(...d3.extent(data, d => d.date)),
    { format: d3.utcFormat("%Y %b %-d"), loop: false }
  );
  scrubber.style.marginBottom = "12px";
  scrubber.style.background = "rgba(0, 0, 0, 0.6)";
  scrubber.style.padding = "6px 12px";
  scrubber.style.borderRadius = "4px";

  // Force inner span (date display) to white
  const observer = new MutationObserver(() => {
    const span = scrubber.querySelector("span");
    if (span) span.style.color = "white";
  });
  observer.observe(scrubber, { childList: true, subtree: true });

  // Update chart on scrubber input
  scrubber.addEventListener("input", () => {
    wrapper.update(scrubber.value);
  });

  wrapper.appendChild(scrubber);
  wrapper.appendChild(svg.node());

  return Object.assign(wrapper, {
    update(date) {
      dot
        .filter(d => d.date > previousDate && d.date <= date)
        .transition().attr("r", 3);
      dot
        .filter(d => d.date <= previousDate && d.date > date)
        .transition().attr("r", 0);
      previousDate = date;
    }
  });
}

async function _data(FileAttachment, projection, parseDate) {
  return (await FileAttachment("viz1data.tsv").tsv())
    .map(d => {
      const p = projection(d);
      p.date = parseDate(d.Haunting_Occurred);
      return p;
    })
    .sort((a, b) => a.date - b.date);
}

function _parseDate(d3) {
  return d3.utcParse("%Y-%m-%d");
}

function _projection(d3) {
  return d3.geoAlbersUsa().scale(1280).translate([480, 300]);
}

async function _us(d3) {
  const us = await d3.json("https://cdn.jsdelivr.net/npm/us-atlas@1/us/10m.json");
  us.objects.lower48 = {
    type: "GeometryCollection",
    geometries: us.objects.states.geometries.filter(d => d.id !== "02" && d.id !== "15")
  };
  return us;
}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["viz1data.tsv", { url: new URL("../data/viz1data.tsv", import.meta.url), mimeType: "text/tab-separated-values", toString }]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));

  main.variable(observer("chart")).define("chart", ["d3", "topojson", "us", "data", "Scrubber"], _chart);
  main.variable(observer("data")).define("data", ["FileAttachment", "projection", "parseDate"], _data);
  main.variable(observer("parseDate")).define("parseDate", ["d3"], _parseDate);
  main.variable(observer("projection")).define("projection", ["d3"], _projection);
  main.variable(observer("us")).define("us", ["d3"], _us);

  const child1 = runtime.module(define1);
  main.import("Scrubber", child1);

  return main;
}
