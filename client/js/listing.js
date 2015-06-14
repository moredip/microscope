var _ = require('underscore'),
    moment = require('moment'),
    EventEmitter = require('events').EventEmitter,
    ES = require('./es'),
    createElements = require('./createElements'),
    Furniture = require('./components/furniture'),
    DurationHistogram = require('./components/durationHistogram'),
    Breadcrumbs = require('./components/breadcrumbs'),
    FilterHeader = require('./components/filterHeader');

require('twix');

var TraceListing = React.createClass({
  render: function(){
    var trace = this.props.trace;

    var millis = ""+trace.elapsedMillis+"ms";
    var timestamp = moment(trace['@timestamp']);
    var url = "trace.html?"+trace.Correlation_ID;
    var barWidth=""+this.props.durationRange(trace.elapsedMillis)+"%";

    return <a href={url}>
        <li>
          {timestamp.format("MMM M YYYY HH:mm.SSS ZZ")}
          <span className="trace-duration">{millis}</span>
          <span className="duration-bar" style={{width:barWidth}}/>
        </li>
      </a>;
  }
});

function tracesDurationRange(traces){
  var maxDuration = _.max(traces, function(trace){ return trace.elapsedMillis; }).elapsedMillis;
  return d3.scale.linear()
    .domain([0,maxDuration])
    .range([0,100]);
}

var AppComponent = React.createClass({
  renderTracesHeader: function(){
    var extraDetail = "";
    if( this.props.elapsedMillisClip ){
      extraDetail = ", "+Math.round(this.props.elapsedMillisClip[0])+"ms to "+Math.round(this.props.elapsedMillisClip[1])+"ms in duration";
    }
    return <h2>traces involving <span className="service-name">{this.props.serviceName}</span>{extraDetail}</h2>;
  },


  render: function(){
    var durationRange = tracesDurationRange(this.props.traceRoots);
    var traces = _.map(this.props.traceRoots,function(trace){
      return <TraceListing key={trace.spanId} trace={trace} durationRange={durationRange}/>;
    });
    

    var breadcrumbs = <Breadcrumbs crumbs={[['services','index.html'],[this.props.serviceName]]}/>;

    return <section className="service-listing">
        <h1 className="main">service detail</h1>
        <h2>service call duration histogram for <span className="service-name">{this.props.serviceName}</span></h2>
        <DurationHistogram onSelectionChanged={this.props.onHistogramSelectionChanged} width={700} height={200} data={this.props.histogram}/>
        {this.renderTracesHeader()}
        <ul className="service-traces">{traces}</ul>
      </section>;
  }
});


function timeRangeEndingNowWithDuration(duration){
  var rangeEnd = moment(); // NOW
  return duration.beforeMoment(rangeEnd);
}

function appController(serviceName){
  var eventBus = new EventEmitter();
  var appContainer = document.getElementsByTagName('body')[0];
  var timeRange = timeRangeEndingNowWithDuration(moment.duration({days:1}));

  var traceSearchParams = {
    serviceName: serviceName,
    elapsedMillisClip: false,
    filterQuery: false
  }

  function handleHistogramSelectionChange(selectionRange){
    traceSearchParams.elapsedMillisClip = selectionRange;
    refresh();
  }

  //function handleNewFilterQuery(newFilterQuery){
    //traceSearchParams.filterQuery = newFilterQuery;
    //refresh();
  //}

  function refresh(){
    ES.getAllTracesInvolvingService(traceSearchParams).then(function(result){

      var app = <AppComponent 
            onHistogramSelectionChanged={handleHistogramSelectionChange} 
            serviceName={serviceName} 
            elapsedMillisClip={traceSearchParams.elapsedMillisClip}
            traceRoots={result.spans} 
            histogram={result.histogram}/>;

      var furniture = <Furniture eventBus={eventBus} content={app} timeRange={timeRange}/>;

      React.render( furniture, appContainer );
    });
  }

  refresh();
}

var serviceName = window.location.search.substr(1);
appController(serviceName);

