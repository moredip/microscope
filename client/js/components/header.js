var _ = require('underscore'),
    TimeScrubber = require('./timeScrubber'),
    HeaderHistogram = require('./headerHistogram');

module.exports = React.createClass({
  displayName: "Header",

  getInitialState: function(){
    return { 
      histogramData: false
    };
  },

  handleNewHistogramData: function(data){
    console.log('new histo data');
    this.setState({ histogramData: data });
  },

  componentWillMount: function(){
    var timeRangeController = this.props.timeRangeController;

    timeRangeController.onHistoChange( _.bind(this.handleNewHistogramData,this) );

    timeRangeController.resetTimeRange();
  },

  render: function(){
    console.log('rendering Header',this.state);

    var histoEl = undefined;
    if( this.state.histogramData ){
        histoEl = <HeaderHistogram data={this.state.histogramData} timeRangeController={this.props.timeRangeController} width={700} height={80}/>
    }

    return <header>
        <div className="masthead">
          <a href="index.html">
            <img className="logo" src="images/microscope-logo.svg" alt="microscope logo"/>
          </a>
          <h1>MicroScope</h1>
        </div>
        {histoEl} 
      </header>;
  }
});
