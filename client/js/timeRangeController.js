var moment = require('moment'),
    EventEmitter = require('events').EventEmitter,
    es = require('./es');

require('twix');

module.exports = function createTimeRangeController(params){
  var eventEmitter = new EventEmitter();

  function resetTimeRange(){
    // last 7 days
    var twixRange = moment.duration({days:30}).beforeMoment(moment());
    var resolution = "6h";

    var range = [+twixRange.start,+twixRange.end];
    console.log( 'resetting time range', range );


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
