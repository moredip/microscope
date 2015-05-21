var _ = require('underscore'),
    EventEmitter = require('events').EventEmitter,
    cx = React.addons.classSet,
    ES = require('./es'),
    forWhere = require('./forWhere');

// Stolen from http://bl.ocks.org/tgk/5744943
function hashCode(str){
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

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
    if( this.props.hasChildren ){
      prefix = "";
    }else if( this.props.expandChildren ){
      prefix = "[-] ";
    }else{
      prefix = "[+] ";
    }
    return prefix + this.props.name;
  },
  render: function(){
    var props=this.props;
    return <g transform={"translate("+props.x+","+props.y+")"}>
          <rect 
            onClick={this.handleClick}
            onMouseEnter={this.handleEnter}
            onMouseLeave={this.handleLeave}
            height={props.dy}
            width={props.dx}
            className={cx({'waterfall-line':true, highlighted:props.highlighted})}
          />
          <text x="1em" dy={props.dy/2} textAnchor="left">{this.label()}</text>
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
                expandChildren={span.expandChildren}
                hasChildren={_.isEmpty(span.children)}
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
    React.render(
        <WaterfallChart eventBus={eventBus} spans={spans}/>,
        appContainer
    );
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
