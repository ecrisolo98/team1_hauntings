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

  // Create container
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "flex-start";
  wrapper.style.maxWidth = "960px";
  wrapper.style.margin = "0 auto";

  // Create scrubber
  const scrubber = Scrubber(
    d3.utcWeek.every(2).range(...d3.extent(data, d => d.date)),
    { format: d3.utcFormat("%Y %b %-d"), loop: false }
  );
  scrubber.style.marginBottom = "12px";

  // Make the date display white
  const dateDisplay = scrubber.querySelector("span");
  if (dateDisplay) {
    dateDisplay.style.color = "white";
  }

  // Wire scrubber to update
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
