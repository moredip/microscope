var _ = require('underscore'),
    ES = require('./es'),
    DurationHistogram = require('./components/durationHistogram'),
    Breadcrumbs = require('./components/breadcrumbs'),
    Header = require('./components/header');

var AppComponent = React.createClass({
  renderTracesHeader: function(){
    var extraDetail = "";
    if( this.props.elapsedMillisClip ){
      extraDetail = ", "+Math.round(this.props.elapsedMillisClip[0])+"ms to "+Math.round(this.props.elapsedMillisClip[1])+"ms in duration";
    }
    return <h2>traces involving <span className="service-name">{this.props.serviceName}</span>{extraDetail}</h2>;
  },
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
        <Header onFilterQuery={this.props.onFilterQuery}/>
        <h1 className="main">service detail</h1>
        <h2>service call duration histogram for <span className="service-name">{this.props.serviceName}</span></h2>
        <DurationHistogram onSelectionChanged={this.props.onHistogramSelectionChanged} width={500} height={200} data={this.props.histogram}/>
        {this.renderTracesHeader()}
        <ul className="service-traces">{traces}</ul>
      </section>;
  }
});

function appController(serviceName){
  var traceSearchParams = {
    serviceName: serviceName,
    elapsedMillisClip: false,
    filterQuery: false
  }

  function handleHistogramSelectionChange(selectionRange){
    traceSearchParams.elapsedMillisClip = selectionRange;
    refresh();
  }

  function handleNewFilterQuery(newFilterQuery){
    traceSearchParams.filterQuery = newFilterQuery;
    refresh();
  }

  function refresh(){
    ES.getAllTracesInvolvingService(traceSearchParams).then(function(result){
      React.render(
          <AppComponent 
            onFilterQuery={handleNewFilterQuery}
            onHistogramSelectionChanged={handleHistogramSelectionChange} 
            serviceName={serviceName} 
            elapsedMillisClip={traceSearchParams.elapsedMillisClip}
            traceRoots={result.spans} 
            histogram={result.histogram}/>,
          document.getElementById('appContainer')
      );
    });
  }

  refresh();
}

var serviceName = window.location.search.substr(1);
appController(serviceName);

