var _ = require('underscore'),
    moment = require('moment'),
    EventEmitter = require('events').EventEmitter,
    ES = require('./es'),
    createElements = require('./createElements'),
    Furniture = require('./components/furniture'),
    Breadcrumbs = require('./components/breadcrumbs');

require('twix');

var ServiceStat = React.createClass({
  render: function(){
    return <li>
      <span className="stat-value">
        {this.props.value} 
        {this.props.units}
      </span>
      <span className="stat-desc">
        {this.props.desc}
      </span>
    </li>;
  }
});

var ServiceOverview = React.createClass({
  render: function(){
    var summary = this.props.summary;

    var url = "listing.html?"+summary.service;

    var stats = _.map([
      [summary.count,"traces"],
      [""+Math.round(summary.mean)+"","mean response time", "ms"],
      [""+Math.round(summary.percentile99)+"","99th percentile response time","ms"],
    ], function( stat, ix ){
      return <ServiceStat key={ix} value={stat[0]} desc={stat[1]} units={stat[2]}/>;
    });

    return <section className="service-summary">
      <h2><a href={url}>{summary.service}</a></h2> 
      <ul>
        {stats}
      </ul>
    </section>;
  }
});

var AppComponent = React.createClass({
  render: function(){
    var serviceListings = createElements( ServiceOverview, this.props.servicesSummary, 'summary' );
    
    return <section className="service-overview">
        <h1 className="main">services overview</h1>
        {serviceListings}
      </section>;
  }
});

function timeRangeEndingNowWithDuration(duration){
  var rangeEnd = moment(); // NOW
  return duration.beforeMoment(rangeEnd);
}

function appController(){
  var appContainer = document.getElementsByTagName('body')[0];
  var eventBus = new EventEmitter();
  var appState = {
    timeRange: timeRangeEndingNowWithDuration(moment.duration({days:1}))
  };

  function refresh(){
    console.log( "time range", appState.timeRange.start.format(), appState.timeRange.end.format() );
    var app = <AppComponent servicesSummary={appState.servicesSummary}/>;
    var furniture = <Furniture eventBus={eventBus} content={app} timeRange={appState.timeRange}/>;

    React.render( furniture, appContainer );
  }

  eventBus.on('durationSelected', function(duration){
    appState.timeRange = timeRangeEndingNowWithDuration(duration);
    refresh();
  });

  ES.getServicesSummary().then( function(servicesSummary){
    appState.servicesSummary = servicesSummary;
    refresh();
  });
}

appController();
