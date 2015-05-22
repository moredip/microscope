var _ = require('underscore'),
    ES = require('./es');

function translationTransform(x,y){
  return "translate("+x+","+y+")";
}

// STILL TO BE DONE: filter by time range, filter by elapsed millis

var Histogram = React.createClass({

  dims: function(){
    var margin = {top: 5, right: 10, bottom: 20, left: 10},
        full = {width:this.props.width,height:this.props.height},
        inner = {
          width:(full.width - margin.left - margin.right),
          height:(full.height - margin.top - margin.bottom)
        };

    return { margin:margin,full:full,inner:inner };
  },

  scales: function(){
    var dims = this.dims();
    var props = this.props;
    var countBuckets = props.data;
    var buckets = _.map(_.keys(countBuckets),parseFloat);

    var x = d3.scale.ordinal()
      .domain(buckets)
      .rangeRoundBands([dims.margin.left, dims.inner.width]);

    var xLinear = d3.scale.linear()
      .domain([ _.min(buckets), _.max(buckets) ])
      .range([dims.margin.left, dims.inner.width]);

    var y = d3.scale.linear()
      .domain([0, _.max(countBuckets)])
        .range([dims.inner.height,dims.margin.top]);

    return {x:x,xLinear:xLinear,y:y};
  },

  generateXAxis: function(){
    var xAxis = d3.svg.axis()
      .scale(this.scales().xLinear)
      .ticks(10)
      .tickFormat(function(d){ return ""+d+"ms"; })
      .orient("bottom");

    xAxis(d3.select(this.getDOMNode()).select('.x.axis'));
  },

  componentDidMount: function(){
    this.generateXAxis();
  },

  render: function(){
    var dims = this.dims();
    var props = this.props;
    var countBuckets = props.data;
    var scales = this.scales();


    var selectionRange = [1000,2350];

    var x = scales.xLinear(selectionRange[1])-scales.xLinear(selectionRange[0])
    var selection = <rect x={scales.xLinear(selectionRange[0])}
        y={2}
        width={x}
        height={dims.inner.height-2}
        className="bar"
      >
        <foo></foo>
      </rect>;


    var bars = _.map( props.data, function(count,bucket){
      return <g 
          className="bar" 
          transform={translationTransform(scales.x(+bucket),scales.y(count))} 
          data-bucket={bucket} 
          data-count={count}
        >
          <rect 
            x="1" 
            width={scales.x.rangeBand()} 
            height={dims.inner.height-scales.y(count)}
          >
         </rect>
      </g>;
    });
    
    // x axis part is filled out by componentDidUpdate
    return <svg width={dims.full.width} height={dims.full.height}>
      {selection}
      <g className="x axis" transform={translationTransform(0,dims.inner.height)}></g> 
      {bars}
    </svg>;

  }
});

var AppComponent = React.createClass({
  render: function(){
    var traces = _.map(this.props.traceRoots,function(traceRoot){
      var millis = ""+traceRoot.elapsedMillis+"ms";
      var timestamp = traceRoot['@timestamp'];
      var url = "trace.html?"+traceRoot.Correlation_ID;
      return <li>
          <a href={url}>{timestamp}</a>
          <span>[{millis}]</span>
        </li>;
    });
    
    return <div>
        <h1>traces starting with {this.props.serviceName}</h1>
        <Histogram width={500} height={200} data={this.props.histogram}/>
        <ul>{traces}</ul>
      </div>;
  }
});

var serviceName = window.location.search.substr(1);

ES.getRootTracesForService(serviceName).then(function(result){
  React.render(
      <AppComponent serviceName={serviceName} traceRoots={result.spans} histogram={result.histogram}/>,
      document.getElementById('appContainer')
  );
});
