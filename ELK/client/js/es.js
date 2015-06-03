require("whatwg-fetch"); // installed as a global

var _ = require('underscore');

module.exports = {
  getAllTracesInvolvingService: getAllTracesInvolvingService,
  getConstructedTrace: getConstructedTrace,
  getServicesSummary:getServicesSummary,
  findRootSpan: findRootSpan,
  visitSpanTreeDepthFirstPreOrder: visitSpanTreeDepthFirstPreOrder
};


function extractLogEntriesFromSearchResponse(response){
  return _.pluck( response.hits.hits, "_source" );
}

function extractHistogramFromSearchResponse(response,aggName){
  var buckets = {};
  _.each( response.aggregations[aggName].buckets, function(bucket){
    buckets[+bucket.key] = bucket.doc_count
  });
  return buckets;
}

function extractStatsFromSearchResponse(response){
  var buckets = {};
  _.each( response.aggregations.service.buckets, function(bucket){
    buckets[bucket.key] = {
      service: bucket.key,
      count: bucket.doc_count,
      percentile99: bucket.duration_percentiles.values["99.0"],
      mean: bucket.duration_stats.avg
    };
  });
  return buckets;
}

function performSearch(searchBody,noHits){
  var searchUrl = "http://localhost:8081/logstash-*/_search";

  if( noHits ){
    searchUrl += "?search_type=count";
  }

  return fetch(searchUrl,{
    method: 'post',
    body: JSON.stringify(searchBody)
  }).then(function(r){ return r.json(); }); // TODO: handle errors
}

function getServicesSummary(){
  var searchBody = {
    "aggs": {
      "service": {
        "terms": {
          "field": "service"
        },
        "aggs": { 
          "duration_stats": { 
            "extended_stats": {
              "field": "elapsedMillis"
            }
          },
          "duration_percentiles": { 
            "percentiles": {
              "field": "elapsedMillis",
              "percents" : [99]
            }
          }
        }
      }
    }
  };

  return performSearch(searchBody,true)
    .then(function(response){
      return extractStatsFromSearchResponse(response);
    });
}


function getAllTracesInvolvingService(params){
  var searchBody = {
    size: 500,
    query: { 
      filtered: {
        filter: {
          bool: {
            must: [
              {
                term: { "service.raw":params.serviceName }
              },
              {
                exists: {"field":"Correlation_ID"}
              },
              {
                exists: {"field":"spanId"}
              }
            ]
          }
        }
      }
    },
    aggs: { 
      elapsedMillis: {
        histogram: {
          field: "elapsedMillis",
          interval:"40"
        }
      }
    }
  };

  if( params.elapsedMillisClip ){
    searchBody.filter = {
      range: { 
        elapsedMillis: {
          gte: params.elapsedMillisClip[0],
          lte: params.elapsedMillisClip[1]
        }
      }
    };
  }

  if( params.filterQuery ){
    searchBody.query.filtered.query = {
      query_string: {
        default_field: "message",
        query: params.filterQuery
      }
    }
  }

  return performSearch(searchBody)
    .then(function(response){
      var spans = extractLogEntriesFromSearchResponse(response);
      var histogram = extractHistogramFromSearchResponse(response,"elapsedMillis");
      return {
        spans:spans,
        histogram:histogram
      };
    });
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
    span.depth = currDepth;
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
