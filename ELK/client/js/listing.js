var _ = require('underscore'),
    ES = require('./es'),
    DurationHistogram = require('./components/DurationHistogram');

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
        <h1><em>{this.props.serviceName}</em> spans</h1>
        <DurationHistogram onSelectionChanged={this.props.onHistogramSelectionChanged} width={500} height={200} data={this.props.histogram}/>
        <ul>{traces}</ul>
      </div>;
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
