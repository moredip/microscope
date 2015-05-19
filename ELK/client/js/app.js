
function traversedSpans(rootSpan){
  var spans = [];
  ES.visitSpanTreeDepthFirstPreOrder(rootSpan, function(span){
    spans.push(span);
  });
  return spans;
}

function renderTraceSpanTree(spans){

  var rootSpan = ES.findRootSpan(spans);
  var sequencedSpans = traversedSpans(rootSpan);

  console.log( 'root', rootSpan );
  console.log( 'sequenced spans', sequencedSpans );

  var margin = {top: 1, right: 1, bottom: 6, left: 1},
    width = 960 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    rowHeight = 40, rowVertPadding = 5,
    rowHeightWithPadding = rowHeight + rowVertPadding;

  var color = d3.scale.category20();

  var x = d3.scale.linear()
    .domain([0,rootSpan.elapsedMillis])
    .range([0,width]);

  var baseTimeOffset = rootSpan.startTime;

  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var span = svg.append("g").selectAll(".span")
    .data(sequencedSpans)
  .enter().append("g")
    .attr("class", "span")
    .attr("transform", function(d,ix) { return "translate(" + x(5+d.startTime-baseTimeOffset) + "," + (ix*rowHeightWithPadding) + ")"; })

  span.append("rect")
    .attr("height", rowHeight)
    .attr("width", function(d) { return x(d.elapsedMillis-10); })
    .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
    .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
  .append("title")
    .text(function(d) { return d.name; });

  span.append("text")
      .attr("x", "1em")
      .attr("dy", rowHeight/2)
      .attr("text-anchor", "left")
      .text(function(d) { return d.name; })
      //.style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });
  
}

var traceId = window.location.search.substr(1);
ES.getConstructedTrace(traceId).then( renderTraceSpanTree );
