var _ = require('underscore'),
    ES = require('./es'),
    DurationHistogram = require('./components/durationHistogram'),
    Breadcrumbs = require('./components/breadcrumbs'),
    Header = require('./components/header');

var AppComponent = React.createClass({
  render: function(){
    var traces = _.map(this.props.traceRoots,function(traceRoot){
      var millis = ""+traceRoot.elapsedMillis+"ms";
      var timestamp = traceRoot['@timestamp'];
      var url = "trace.html?"+traceRoot.Correlation_ID;
      return <li key={traceRoot.spanId}>
          <a href={url}>{timestamp}</a>
          <span>[{millis}]</span>
        </li>;
    });

    var breadcrumbs = <Breadcrumbs crumbs={[['services','index.html'],[this.props.serviceName]]}/>;
    
    return <section className="service-listing">
        <Header/>
        <h1 className="main">service detail</h1>
        <h2>service call duration histogram for <span className="service-name">{this.props.serviceName}</span></h2>
        <DurationHistogram onSelectionChanged={this.props.onHistogramSelectionChanged} width={500} height={200} data={this.props.histogram}/>
        <h2>traces involving <span className="service-name">{this.props.serviceName}</span></h2>
        <ul className="service-traces">{traces}</ul>
      </section>;
  }
});

var serviceName = window.location.search.substr(1);

function handleHistogramSelectionChange(selectionRange){
  refresh(serviceName,selectionRange);
}

function refresh(serviceName,elapsedMillisClip){
  ES.getAllTracesInvolvingService(serviceName,elapsedMillisClip).then(function(result){
    React.render(
        <AppComponent onHistogramSelectionChanged={handleHistogramSelectionChange} serviceName={serviceName} traceRoots={result.spans} histogram={result.histogram}/>,
        document.getElementById('appContainer')
    );
  });
}

refresh(serviceName);
