var _ = require('underscore'),
    ES = require('./es');


// STILL TO BE DONE: filter by time range, filter by elapsed millis


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
        <ul>{traces}</ul>
      </div>;
  }
});

var serviceName = window.location.search.substr(1);

ES.getRootTracesForService(serviceName).then(function(traceRoots){
  React.render(
      <AppComponent serviceName={serviceName} traceRoots={traceRoots}/>,
      document.getElementById('appContainer')
  );
});
