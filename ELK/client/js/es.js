window.ES = (function($){

function extractLogEntriesFromSearchResponse(response){
  return _.pluck( response.hits.hits, "_source" );
}

function getRootTracesForService(serviceName){
  var searchBody = {
    "size" : 500,
    "query" : {
      "bool": {
        "must_not": [
          { "match": {
            "Correlation_ID.raw": ""
          }
          }
        ],
        "must": [
          {
            "match": { "service.raw":serviceName }
          }
        ]
      }
    },
    "filter" : {
      "bool": {
        "must": [
          {
            "missing" : {"field":"parentSpanId" }
          },
          {
            "exists" : {"field":"spanId"}
          }
        ]
      }
    }
  };
  var searchUrl = "http://localhost:8081/logstash-*/_search";

  return $.ajax({
    url: searchUrl,
    data: JSON.stringify(searchBody),
    type: 'POST',
    processData: false
  }).then(extractLogEntriesFromSearchResponse);
}

return {
  getRootTracesForService: getRootTracesForService
};

}($));
