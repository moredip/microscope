var _ = require('underscore'),
    ES = require('./es');

function traversedSpans(rootSpan){
  var spans = [];
  ES.visitSpanTreeDepthFirstPreOrder(rootSpan, function(span){
    spans.push(span);
  });
  return spans;
}

var WaterfallLine = React.createClass({
  render: function(){
    var props=this.props;
    return <g transform={"translate("+props.x+","+props.y+")"}>
          <rect 
            height={props.dy}
            width={props.dx}
            fill={props.color}
            style={{stroke:d3.rgb(props.color).darker(2)}}
          />
          <text x="1em" dy={props.dy/2} textAnchor="left">{props.name}</text>
    </g>
  }
});

var WaterfallChart = React.createClass({
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
      return <WaterfallLine
                name={span.name}
                dx={x(span.elapsedMillis)}
                dy={props.rowHeight}
                x={x(5+span.startTime-baseTimeOffset)}
                y={ix*rowHeightWithPadding}
                color={color(span.name.replace(/ .*/, ""))}
                />
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
});

function renderTraceSpanTree(spans){
  React.render(
      <WaterfallChart spans={spans}/>,
      document.getElementById('appContainer')
  );
}

var traceId = window.location.search.substr(1);
ES.getConstructedTrace(traceId).then( renderTraceSpanTree );
