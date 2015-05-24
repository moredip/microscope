var _ = require('underscore'),
    ES = require('./es');

var ServiceOverview = React.createClass({
  render: function(){
    var summary = this.props.summary;

    var url = "listing.html?"+summary.service;

    return <section class="service-summary">
      <h2><a href={url}>{summary.service}</a></h2> 
      <dl>
        <dt>Number of traces</dt>
        <dd>{summary.count}</dd>
        <dt>Mean response time</dt>
        <dd>{Math.round(summary.mean)}ms</dd>
        <dt>99th percentile response time</dt>
        <dd>{Math.round(summary.percentile99)}ms</dd>
      </dl>
    </section>;
  }
});

var AppComponent = React.createClass({
  render: function(){
    var serviceListings = _.map(this.props.servicesSummary,function(serviceSummary){
      return <ServiceOverview summary={serviceSummary}/>
    });
    
    return <div>
        <h1>Services Overview</h1>
        {serviceListings}
      </div>;
  }
});

ES.getServicesSummary().then(function(servicesSummary){
  console.log( servicesSummary );
  React.render(
      <AppComponent servicesSummary={servicesSummary}/>,
      document.getElementById('appContainer')
  );
});
