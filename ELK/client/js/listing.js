var serviceName = window.location.search.substr(1);

/* 
 
a list of available traces for a given service and response time range
- for a given timerange, service-name, and range of elapsedMillis
- bucket by span id where service-name AND parent span id is empty (e.g. into traces) AND elapsedMillis in range
- a list of matching spans. display timestamp, trace id and elapsed millis

*/

ES.getRootTracesForService(serviceName).then(function(logEntries){
  console.log('matching traces', logEntries);

  var $listEntries = _.map(logEntries,function(logEntry){
    var label = logEntry.service + " - " + logEntry.Correlation_ID;
    var url = "trace.html?"+logEntry.Correlation_ID;
    return $("<li/>").append(
      $("<a/>").attr("href",url).text(label) 
    );
  });

  $('.traces').append($listEntries);

});
