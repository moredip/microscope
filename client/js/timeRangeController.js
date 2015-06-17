var moment = require('moment'),
    EventEmitter = require('events').EventEmitter,
    es = require('./es');

require('twix');

module.exports = function createTimeRangeController(params){
  var eventEmitter = new EventEmitter();

  function histogramResolutionForRange(twixRange){
    var approxNumberOfBins = 200;

    var unit;
    if( twixRange.length("minutes") > 0 ){
      unit = "minutes";
    }else{
      unit = "seconds";
    }

    var resolution = twixRange.length(unit) / approxNumberOfBins;
    var duration = moment.duration(resolution, unit);
    
    // ack, this sucks, but can't think of a better way to get the ES API something it can use
    duration.asInterval = function(){ return ""+resolution+(unit[0]); } 

    return duration
  }

  function setTwixTimeRange(twixRange){
    var resolution = histogramResolutionForRange(twixRange);

    console.log( 'new time range start', twixRange.start.toString() );
    console.log( 'new time range end  ', twixRange.end.toString() );

    var range = [+twixRange.start,+twixRange.end];

    es.getTraceCountHistogramOverTime(range,resolution).then( function({histogram,totalCount}){
      var payload = {
        range,
        resolution,
        totalCount,
        bins:histogram
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

  return { resetTimeRange, setTimeRange, onHistoChange };
};
