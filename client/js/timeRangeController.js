var moment = require('moment'),
    EventEmitter = require('events').EventEmitter,
    es = require('./es');

require('twix');

module.exports = function createTimeRangeController(params){
  var eventEmitter = new EventEmitter();

  function histogramResolutionForRange(twixRange){
    var approxNumberOfBins = 200;
    var resolution = twixRange.length("minutes") / approxNumberOfBins;
    return ""+Math.round(resolution)+"m";
  }

  function setTwixTimeRange(twixRange){
    var resolution = histogramResolutionForRange(twixRange);

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

  function setTimeRange(range){
    var twixRange = moment.twix(range[0],range[1]);
    setTwixTimeRange(twixRange);
  }

  function resetTimeRange(duration){
    if( !duration ){
      duration = {days:30};
    }

    var twixRange = moment.duration(duration).beforeMoment(moment());
    setTwixTimeRange(twixRange);
  }

  function onHistoChange(handler){
    eventEmitter.on('histoChange',handler);
  }

  return {
    resetTimeRange:resetTimeRange,
    setTimeRange:setTimeRange,
    onHistoChange:onHistoChange
  };
};
