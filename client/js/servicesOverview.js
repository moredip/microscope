var _ = require('underscore'),
    ES = require('./es'),
    createElements = require('./createElements'),
    Breadcrumbs = require('./components/breadcrumbs');

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

ES.getServicesSummary().then(function(servicesSummary){
  console.log( servicesSummary );
  React.render(
      <AppComponent servicesSummary={servicesSummary}/>,
      document.getElementById('appContainer')
  );
});
