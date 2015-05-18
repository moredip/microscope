var traceId = window.location.search.substr(1);
var searchUrl = "http://localhost:8081/_all/_search?size=500&q=Correlation_ID.raw:" + traceId;

function findRootSpan(spans){
  return _.find( spans, function(span){
    return typeof span.parentSpanId === 'undefined'
  });
}

function decorateSpansWithDepthInfo(spans){
  function walk(span, currDepth){
    span.depth = currDepth;
    _.each( span.children, function(childSpan){
      walk(childSpan, currDepth + 1);
    });
  };

  walk(findRootSpan(spans),0);
}

function spansFromLogEntries(logEntries){
  var spans = _.indexBy(logEntries,'spanId');

  _.each( spans, function(span){
    span.name = span.service + " - " + span.spanId;
    span.value = span.elapsedMillis = +span.elapsedMillis;

    if( span.parentSpanId ){
      span.parentSpan = spans[span.parentSpanId];
      if( span.parentSpan.children ){
        span.parentSpan.children.push(span);
      }else{
        span.parentSpan.children = [span];
      }
    }
  });

  decorateSpansWithDepthInfo(spans);

  return _.values(spans);
}

function annotateSpansWithLayout(spans, chartWidth, spanHeight){
  var heightWithPadding = spanHeight + 10;

  var rootSpan = findRootSpan(spans);

  var x = d3.scale.linear()
    .domain([0,rootSpan.elapsedMillis])
    .range([0,chartWidth]);

  function decorateSpanTreeWithTimeOffset(span){
    var timeOffset = span.timeOffset;
    
    _.each(span.children,function(childSpan){
      childSpan.timeOffset = timeOffset;
      timeOffset += childSpan.elapsedMillis;
      decorateSpanTreeWithTimeOffset(childSpan);
    });
  }

  rootSpan.timeOffset = 0;
  decorateSpanTreeWithTimeOffset(rootSpan);
  _.each( spans, function(span){
    span.x = x(span.timeOffset);
    span.y = span.depth * heightWithPadding;
    span.dx = x(span.elapsedMillis);
    span.dy = spanHeight;
  });
}

function renderSpans(spans){
  var margin = {top: 1, right: 1, bottom: 6, left: 1},
    width = 960 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    spanHeight = 20;

  var partition = d3.layout.partition()
    .sort( function(a,b){ return a.timestamp - b.timestamp; } )
    .size([2 * Math.PI, 300 * 300]);

  var partitioned = partition(findRootSpan(spans));

  //annotateSpansWithLayout(spans, width, spanHeight);
  console.log('partitioned',partitioned);

  var color = d3.scale.category20(),
      x = d3.scale.linear().range([0, width]),
      y = d3.scale.linear().range([0, height]);

  var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });
  

  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + (margin.left+300) + "," + (margin.top+300) + ")");

  var span = svg.append("g").selectAll(".span")
    .data(partitioned)
  .enter().append("path")
      .attr("class","span")
      .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
      .attr("d", arc)
      .style("stroke", "#fff")
      .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
      .style("fill-rule", "evenodd");

  //var span = svg.append("g").selectAll(".span")
    //.data(partitioned)
  //.enter().append("g")
    //.attr("class", "span")
    //.attr("transform", function(d) { return "translate(" + x(d.x) + "," + x(d.y) + ")"; })

  //span.append("rect")
    //.attr("height", function(d) { return y(d.dy); })
    //.attr("width", function(d) { return x(d.dx); })
    //.style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
    //.style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
  //.append("title")
    //.text(function(d) { return d.name; });

}

function processResponseJson(json){
  var logEntries = json.hits.hits.map( function(h){
    return h._source;
  });

  var spans = spansFromLogEntries(logEntries);
  renderSpans(spans);
}

fetch(searchUrl).then( function(r){
  return r.json();
}).then(processResponseJson);
