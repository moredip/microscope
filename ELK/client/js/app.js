var traceId = window.location.search.substr(1);
var searchUrl = "http://localhost:8081/_all/_search?q=Correlation_ID:" + traceId;


function mapLogDocsIntoSankeyNodes(logDocs){
  return logDocs.map( function(logDoc){
    return {
      spanId: logDoc.spanId,
      name: logDoc.service
    };
  } );
}

function mapLogDocsIntoSankeyLinks(logDocs,nodeList){

  // TODO: replace with hash lookup
  function nodeForSpanId(spanId){
    return _.findWhere(nodeList, {spanId: spanId});
  }

  
  var links = [];
  logDocs.forEach( function(logDoc){
    if( logDoc.spanId && logDoc.parentSpanId ){
      var link = {
        source: nodeForSpanId(logDoc.parentSpanId),
        target: nodeForSpanId(logDoc.spanId),
        value: logDoc.elapsedMillis
      };
      console.log('link',link);
      links.push(link);
    }
  });

  return links;
}

function sankeyAndDataForResponse(response){
  var traces = response.hits.hits.map( function(h){
    return h._source;
  });

  var nodes = mapLogDocsIntoSankeyNodes(traces);
  var links = mapLogDocsIntoSankeyLinks(traces,nodes);

  var sankey = d3.sankey()
    .size([400, 400])
    .nodeWidth(15)
    .nodePadding(10)
    .nodes(nodes)
    .links(links)
    .layout(32);

  return {
    sankey:sankey,
    nodes:nodes,
    links:links
  };
}

function displaySankey(params){
  // ALL BASED ON http://bost.ocks.org/mike/sankey/
  
  var sankey = params.sankey;
  var links = params.links;
  var nodes = params.nodes;

  var margin = {top: 1, right: 1, bottom: 6, left: 1},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var formatNumber = d3.format(",.0f"),
      format = function(d) { return formatNumber(d) + " TWh"; },
      color = d3.scale.category20();

  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var link = svg.append("g").selectAll(".link")
      .data(links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", sankey.link())
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });


    var node = svg.append("g").selectAll(".node")
      .data(nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })

    node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
      .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
    .append("title")
      .text(function(d) { return d.name; });

    node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");
}

fetch(searchUrl).then( function(r){
  return r.json();
}).then(sankeyAndDataForResponse)
  .then(displaySankey);

