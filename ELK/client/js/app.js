function traversedSpans(rootSpan){
  var spans = [];
  ES.visitSpanTreeDepthFirstPreOrder(rootSpan, function(span){
    spans.push(span);
  });
  return spans;
}

var WaterfallLine = React.createFactory(React.createClass({
  render: function() {
    return React.DOM;
  }
}));

var WaterfallChart = React.createFactory(React.createClass({
  getDefaultProps: function(){
    var margin = {top: 1, right: 1, bottom: 6, left: 1};
    return {
      margin: margin,
      width: 960 - margin.left - margin.right,
      height: 800 - margin.top - margin.bottom,
      rowHeight: 30,
      rowVertPadding: 5
    };
  },

  renderWaterfallLines: function(){
    var props = this.props;

    var rootSpan = ES.findRootSpan(props.spans);
    var sequencedSpans = traversedSpans(rootSpan);

    var color = d3.scale.category20();
    var x = d3.scale.linear()
      .domain([0,rootSpan.elapsedMillis])
      .range([0,props.width]);

    var rowHeightWithPadding = props.rowHeight + props.rowVertPadding;

    var baseTimeOffset = rootSpan.startTime;

    return _.map(sequencedSpans,function(span,ix){
      return React.DOM.g( {
        transform: "translate(" + x(5+span.startTime-baseTimeOffset) + "," + (ix*rowHeightWithPadding) + ")"
      },
        React.DOM.rect({
          height: props.rowHeight,
          width: x(span.elapsedMillis),
          fill: span.color = color(span.name.replace(/ .*/, "")),
          style: {stroke: d3.rgb(span.color).darker(2)}
        }),
        React.DOM.text({
          x: "1em",
          dy: props.rowHeight/2,
          "text-anchor": "left"
        }, span.name )
      );
    });
  },

  render: function() {


    return React.DOM.svg( {
      width: this.props.width + this.props.margin.left + this.props.margin.right,
      height: this.props.height + this.props.margin.top + this.props.margin.bottom
    },
      React.DOM.g({
        transform: "translate(" + this.props.margin.left + "," + this.props.margin.top + ")"
      },
        this.renderWaterfallLines()
      )
    );
  }
}));

function renderTraceSpanTree(spans){
  React.render(
      WaterfallChart({spans:spans}),
      document.getElementById('chart')
  );
}

var traceId = window.location.search.substr(1);
ES.getConstructedTrace(traceId).then( renderTraceSpanTree );
