var serviceName = window.location.search.substr(1);
var searchUrl = "http://localhost:8081/_all/_search?size=500&q=Correlation_ID.raw:" + traceId;

/* 
 
a list of available traces for a given service and response time range
- for a given timerange, service-name, and range of elapsedMillis
- bucket by span id where service-name AND parent span id is empty (e.g. into traces) AND elapsedMillis in range
- a list of matching spans. display timestamp, trace id and elapsed millis

*/

$(function(){
  window.alert('hai');
});
