window.ES = (function($){

function extractLogEntriesFromSearchResponse(response){
  return _.pluck( response.hits.hits, "_source" );
}

function performSearch(searchBody){
  var searchUrl = "http://localhost:8081/logstash-*/_search";

  return $.ajax({
    url: searchUrl,
    data: JSON.stringify(searchBody),
    type: 'POST',
    processData: false
  });
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
  visitorFn(spanTreeRoot);
  _.each( spanTreeRoot.children, function(childSpan){ 
    visitSpanTreeDepthFirstPreOrder(childSpan,visitorFn);
  });
}

function decorateSpansWithParentChildLinks(spans){
  var spanMap = _.indexBy(spans,'spanId');

  _.each( spans, function(span){
    span.elapsedMillis = +span.elapsedMillis;
    span.endTime = Date.parse(span.time);
    span.startTime = span.endTime - span.elapsedMillis;
    span.name = span.service

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

return {
  getRootTracesForService: getRootTracesForService,
  getConstructedTrace: getConstructedTrace,
  findRootSpan: findRootSpan,
  visitSpanTreeDepthFirstPreOrder: visitSpanTreeDepthFirstPreOrder
};

}($));
