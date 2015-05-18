var serviceName = window.location.search.substr(1);

// STILL TO BE DONE: filter by time range, filter by elapsed millis

ES.getRootTracesForService(serviceName).then(function(logEntries){
  // console.log(logEntries[0]);

  $(".headline").text("traces starting with "+serviceName);
 
  var $listEntries = _.map(logEntries,function(logEntry){
    var millis = ""+logEntry.elapsedMillis+"ms";
    var timestamp = logEntry['@timestamp'];
    var url = "trace.html?"+logEntry.Correlation_ID;

    return $("<li/>").append(
      $("<a/>").attr("href",url).text(timestamp),
      $("<span/>").text(" ["+millis+"]")
    );
  });

  $('.traces').append($listEntries);
});
