require("whatwg-fetch"); // installed as a global

var _ = require('underscore');

module.exports = {
  getRootTracesForService: getRootTracesForService,
  getConstructedTrace: getConstructedTrace,
  findRootSpan: findRootSpan,
  visitSpanTreeDepthFirstPreOrder: visitSpanTreeDepthFirstPreOrder
};


function extractLogEntriesFromSearchResponse(response){
  return _.pluck( response.hits.hits, "_source" );
}

function performSearch(searchBody){
  var searchUrl = "http://localhost:8081/logstash-*/_search";

  return fetch(searchUrl,{
    method: 'post',
    body: JSON.stringify(searchBody)
  }).then(function(r){ return r.json(); }); // TODO: handle errors
}


//# Service profile: response time distribution
//a histogram summarizing the distributions of response time for a given service
//- for a given timerange, service-name
//- bucket by span id where service-name AND parent span id is empty (e.g. into traces)
//- histogram of elapsedMillis. x is count

function getServiceProfile(serviceName){
}

function getRootTracesForService(serviceName){
  var searchBody = {
    "size" : 500,
    "filter" : {
      "bool": {
        "must": [
          {
            "term": { "service.raw":serviceName }
          },
          {
            "exists" : {"field":"Correlation_ID"}
          },
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

  return performSearch(searchBody)
    .then(extractLogEntriesFromSearchResponse);
}

function findRootSpan(spans){
  return _.find( spans, function(span){
    return typeof span.parentSpanId === 'undefined'
  });
}

function subSpans(rootSpan){
  if( !rootSpan.children )
    return [];

  return rootSpan.children.concat( _.map(rootSpan.children,subSpans) );
}

function allSpans(rootSpan){
  return _.flatten( [rootSpan].concat( subSpans(rootSpan) ) );
}

function visitSpanTreeDepthFirstPreOrder(spanTreeRoot,visitorFn){
  var bailOut = visitorFn(spanTreeRoot);
  if( bailOut === false ) return;

  _.each( spanTreeRoot.children, function(childSpan){ 
    visitSpanTreeDepthFirstPreOrder(childSpan,visitorFn);
  });
}

function enhanceSpanProperties(span){
  var endTime = Date.parse(span.time);
  var elapsedMillis = +span.elapsedMillis;

  _.extend( span, {
    elapsedMillis: elapsedMillis,
    endTime: endTime,
    startTime: endTime - elapsedMillis,
    name: span.service
  });
}

function decorateSpansWithParentChildLinks(spans){
  var spanMap = _.indexBy(spans,'spanId');

  _.each( spans, function(span){
    enhanceSpanProperties(span);

    if( span.parentSpanId ){
      span.parentSpan = spanMap[span.parentSpanId];
      if( span.parentSpan.children ){
        span.parentSpan.children.push(span);
      }else{
        span.parentSpan.children = [span];
      }
    }
  });

  _.each( spans, function(span){
    if( span.children ){
      span.children = _.sortBy(span.children, 'startTime');
    }else{
      span.children = [];
    }
  });
}

function decorateSpanTreeWithDepthInfo(rootSpan){
  function walk(span, currDepth){
    span.rowIx = currDepth;
    _.each( span.children, function(childSpan){
      walk(childSpan, currDepth + 1);
    });
  };

  walk(rootSpan,0);
}

function transformLogEntriesIntoSpanTree(spans){
  decorateSpansWithParentChildLinks(spans);
  var rootSpan = findRootSpan(spans);
  decorateSpanTreeWithDepthInfo(rootSpan);
  return spans;
}

function getConstructedTrace(correlationId){
  var searchBody = {
    "size" : 500,
    "query" : {
      "bool": {
        "must": [
          { 
            "match": { "Correlation_ID.raw": correlationId }
          }
        ]
      }
    }
  };

  return performSearch(searchBody)
    .then(extractLogEntriesFromSearchResponse)
    .then(transformLogEntriesIntoSpanTree);
}
