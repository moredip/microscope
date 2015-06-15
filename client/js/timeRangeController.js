var moment = require('moment'),
    EventEmitter = require('events').EventEmitter,
    es = require('./es');

require('twix');

module.exports = function createTimeRangeController(params){
  var eventEmitter = new EventEmitter();

  function resetTimeRange(duration){
    if( !duration ){
      duration = {days:30};
    }


    var twixRange = moment.duration(duration).beforeMoment(moment());
    var resolution = "6h";
    if( twixRange.length("weeks") > 4 ){
      resolution = "24h";
    }

    console.log( 'new time range start', twixRange.start.toString() );
    console.log( 'new time range end  ', twixRange.end.toString() );

    var range = [+twixRange.start,+twixRange.end];


    es.getTraceCountHistogramOverTime(range,resolution).then( function(histoBins){
      var payload = {
        range: range,
        resolution: resolution,
        bins:histoBins
      }
      eventEmitter.emit('histoChange',payload);
    });
  }

  function onHistoChange(handler){
    eventEmitter.on('histoChange',handler);
  }

  return {
    resetTimeRange:resetTimeRange,
    onHistoChange:onHistoChange
  };
};
