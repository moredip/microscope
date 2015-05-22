var _ = require('underscore'),
    ES = require('./es');


// STILL TO BE DONE: filter by time range, filter by elapsed millis

var Histogram = React.createClass({
  render: function(){
    var props = this.props;
    var countBuckets = props.data;

    var y = d3.scale.linear()
      .domain([0, d3.max(_.values(countBuckets))])
        .range([props.height,0]);

    var x = d3.scale.ordinal()
      .domain(_.keys(countBuckets))
      .rangeRoundBands([0, props.width]);

    var bars = _.map( props.data, function(count,bucket){
      var transform = "translate("+x(+bucket)+","+y(+count)+")";
      return <g className="bar" transform={transform}>
        <rect 
          x="1" 
          width={x.rangeBand()} 
          height={props.height-y(count)}
        >
         </rect>
      </g>;
    });

    return <svg width={props.width} height={props.height}>
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
