var _ = require('underscore'),
    moment = require('moment'),
    TimeScrubber = require('./timeScrubber'),
    HeaderHistogram = require('./headerHistogram');

require('twix');

module.exports = React.createClass({
  displayName: "Header",

  getInitialState: function(){
    return { 
      timeRange: false,
      hovered: false
    };
  },

  handleNewHistogramData: function(data){
    console.log('new histo data');
    this.setState({ timeRange: data });
  },

  componentWillMount: function(){
    var timeRangeController = this.props.timeRangeController;

    timeRangeController.onHistoChange( _.bind(this.handleNewHistogramData,this) );

    timeRangeController.resetTimeRange();
  },

  render: function(){
    console.log('rendering Header',this.state);

    let histoEl = undefined;
    let timeRangeSummary = undefined;
    if( this.state.timeRange ){
      histoEl = <HeaderHistogram data={this.state.timeRange} timeRangeController={this.props.timeRangeController} width={700} height={80}/>
      timeRangeSummary = moment.twix( this.state.timeRange.range[0],this.state.timeRange.range[1] ).format();
    }

    return <header>
        <div className="masthead">
          <a href="index.html">
            <img className="logo" src="images/microscope-logo.svg" alt="microscope logo"/>
          </a>
          <h1>MicroScope</h1>
        </div>
        <div className="time-range">
          <span className="label">time range: </span>
          <span className="val">{timeRangeSummary}</span>
        </div>
        {histoEl} 
      </header>;
  }
});
