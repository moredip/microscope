var _ = require('underscore'),
    EventEmitter = require('events').EventEmitter,
    cx = React.addons.classSet,
    ES = require('./es'),
    createElements = require('./createElements'),
    Colors = require('./colors'),
    forWhere = require('./forWhere');

function traversedSpans(rootSpan){
  var spans = [];
  ES.visitSpanTreeDepthFirstPreOrder(rootSpan, function(span){
    spans.push(span);
    return span.expandChildren;
  });
  return spans;
}

var WaterfallLine = React.createClass({
  handleClick: function(){
    this.props.eventBus.emit('toggleSpanExpansion',this.props.spanId);
  },
  handleEnter: function(){
    this.props.eventBus.emit('spanHovered',this.props.spanId);
  },
  handleLeave: function(){
    this.props.eventBus.emit('spanUnhovered',this.props.spanId);
  },
  label: function(){
    if( this.props.isLeaf ){
      prefix = "";
    }else if( this.props.expandChildren ){
      prefix = "[-] ";
    }else{
      prefix = "[+] ";
    }
    return prefix + this.props.name + " [" +this.props.elapsedMillis+"ms]";
  },
  render: function(){
    var props=this.props;
    var color=Colors.blue.brighter(props.spanDepth/3);
    var classes=cx({
      'waterfall-line':true, 
      highlighted:props.highlighted,
      leaf:props.isLeaf
    });
    return <g 
      transform={"translate("+props.x+","+props.y+")"}
      className={classes}
      onClick={this.handleClick}
      onMouseEnter={this.handleEnter}
      onMouseLeave={this.handleLeave}
      >
          <rect 
            height={props.dy}
            width={props.dx}
            fill={color}
            stroke={color.darker(1)}
          />
          <text y="4" x="6" dy={props.dy/2} textAnchor="left">{this.label()}</text>
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
      rowHeight: 25,
      rowVertPadding: 5
    };
  },

  onWaterfallLineToggled: function(spanId){
    var span = _.findBy(this.props.spans,'spanId');
  },

  renderWaterfallLines: function(){
    var self = this;
    var props = this.props;

    var rootSpan = ES.findRootSpan(props.spans);
    var sequencedSpans = traversedSpans(rootSpan);

    var x = d3.scale.linear()
      .domain([0,rootSpan.elapsedMillis])
      .range([0,props.width]);

    var rowHeightWithPadding = props.rowHeight + props.rowVertPadding;

    var baseTimeOffset = rootSpan.startTime;

    var lines =  _.map(sequencedSpans,function(span,ix){
      return <WaterfallLine
                key={span.spanId}
                eventBus={props.eventBus}
                onToggle={self.onWaterfallLineToggled}

                spanId={span.spanId}
                name={span.name}
                elapsedMillis={span.elapsedMillis}
                spanDepth={span.depth}
                expandChildren={span.expandChildren}
                isLeaf={_.isEmpty(span.children)}
                highlighted={span.highlighted}

                dx={x(span.elapsedMillis)}
                dy={props.rowHeight}
                x={x(5+span.startTime-baseTimeOffset)}
                y={ix*rowHeightWithPadding}
                />
    });

    return lines;
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

function decorateSpansWithViewSpecificStuff(spans){
  _.each(spans,function(span){
    span.expandChildren = true;
  });
};

function renderTraceSpanTree(spans){
  decorateSpansWithViewSpecificStuff(spans);

  console.log( 'root', ES.findRootSpan(spans) );

  var eventBus = new EventEmitter();
  var appContainer = document.getElementById('appContainer');

  function render(spans){
    var traceId = spans[0].Correlation_ID;
    var appContent = 
        <section className="trace-detail">
          <h1 className="main">distributed call trace</h1>
          <p className="trace-id">trace/correlation ID: {traceId}</p>
          <WaterfallChart eventBus={eventBus} spans={spans}/>
        </section>;

    React.render( appContent, appContainer );
  }

  eventBus.on('toggleSpanExpansion', function(spanId){
    forWhere(spans, {spanId:spanId}, function(span){
      span.expandChildren = !span.expandChildren;
    });
    render(spans);
  });

  eventBus.on('spanHovered', function(spanId){
    _.each(spans, function(span){
      span.highlighted = false;
    });
    forWhere(spans, {spanId:spanId}, function(span){
      ES.visitSpanTreeDepthFirstPreOrder(span,function(subSpan){
        subSpan.highlighted = true;
        return true;
      });
    });
    render(spans);
  });

  eventBus.on('spanUnhovered', function(spanId){
    _.each(spans, function(span){
      span.highlighted = false;
    });
    render(spans);
  });

  render(spans);
}

var traceId = window.location.search.substr(1);
ES.getConstructedTrace(traceId).then( renderTraceSpanTree );
