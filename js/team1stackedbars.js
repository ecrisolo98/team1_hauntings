d3.json("../data/team1bars.json").then(function(data) {
  const width = 928;
  const height = 500;
  const marginTop = 10;
  const marginRight = 10;
  const marginBottom = 40;
  const marginLeft = 40;

  const series = d3.stack()
    .keys(d3.union(data.map(d => d.tod)))
    .value(([, D], key) => D.get(key).count)
    (d3.index(data, d => d.century, d => d.tod));

  const x = d3.scaleBand()
    .domain([...new Set(data.map(d => d.century))])
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
    .rangeRound([height - marginBottom, marginTop]);

  const color = d3.scaleOrdinal()
    .domain(series.map(d => d.key))
    .range(d3.schemeSpectral[series.length])
    .unknown("#ccc");

  const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  svg.append("g")
    .selectAll("g")
    .data(series)
    .join("g")
      .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(D => D.map(d => (d.key = D.key, d)))
    .join("rect")
      .attr("x", d => x(d.data[0]))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
    .append("title")
      .text(d => `${d.data[0]} ${d.key}\n${d.data[1].get(d.key).count}`);

  svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .call(g => g.selectAll(".domain").remove());

  svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y).ticks(null, "s"))
    .call(g => g.selectAll(".domain").remove());

  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", (width - marginLeft - marginRight) / 2 + marginLeft)
    .attr("y", height)
    .attr("dy", "-0.5em")
    .text("Century");

  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height - marginTop - marginBottom) / 2 - marginTop)
    .attr("y", 12)
    .text("Count");

}).catch(function(error) {
  console.error("Error loading data.json:", error);
});

// Create a legend group above the chart
const legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", `translate(${marginLeft},${marginTop})`);

const legendItemSize = 18;
const legendSpacing = 8;

// Flatten the color scale domain
const legendData = color.domain();

// Create one group per item
const legendItems = legend.selectAll(".legend-item")
  .data(legendData)
  .enter()
  .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(${i * 120}, 0)`);

// Add colored squares
legendItems.append("rect")
    .attr("width", legendItemSize)
    .attr("height", legendItemSize)
    .attr("fill", d => color(d))
    .attr("rx", 4)
    .attr("ry", 4);

// Add text next to squares
legendItems.append("text")
    .attr("x", legendItemSize + 6)
    .attr("y", legendItemSize / 2)
    .attr("dy", "0.35em")
    .text(d => d)
    .style("font-size", "12px")
    .style("fill", "#333");

