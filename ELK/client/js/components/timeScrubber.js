var _ = require('underscore'),
    moment = require('moment');

var RANGE_OPTIONS = [
  ["Last 5m",   moment.duration(5,'m')],
  ["Last 15m",  moment.duration(15,'m')],
  ["Last 1h",   moment.duration(1,'h')],
  ["Last 6h",   moment.duration(6,'h')],
  ["Last 12h",  moment.duration(12,'h')],
  ["Last 24h",  moment.duration(24,'h')],
  ["Last 2d",  moment.duration(2,'d')],
  ["Last 7d",  moment.duration(7,'d')],
  ["Last 30d",  moment.duration(30,'d')]
];

var DurationOption = React.createClass({
  handleClick: function(){
    this.props.onDurationSelected(this.props.duration);
  },
  render: function(){
    return <li onClick={this.handleClick}>{this.props.label}</li>;
  }
});

var TimeScrubber = React.createClass({
  getInitialState: function(){
    return {
      expanded: false
    };
  },

  handleSelectClicked: function(){
    this.setState( {expanded: !this.state.expanded} );
  },

  handleDurationSelected: function(duration){
    this.setState( {expanded: false} );
    this.props.eventBus.emit('durationSelected',duration);
  },

  renderDropdownList: function(){
    var that = this;

    if( !this.state.expanded ){
      return undefined;
    }

    var options = _.map( RANGE_OPTIONS, function(opt){
      return <DurationOption onDurationSelected={that.handleDurationSelected} label={opt[0]} duration={opt[1]} key={opt[0]}/>
    });

    return <ul className="dropdown-menu dropdown-select">
      {options}
    </ul>;
  },

  render: function(){
    var rangeDesc = this.props.timeRange.format();

    return <div className="time-scrubber dropdown">
      <div className="dropdown-container">
        <p className="dropdown-description">time range:</p>
        <p onClick={this.handleSelectClicked} className="dropdown-button">{rangeDesc}</p>
        {this.renderDropdownList()}
      </div>
    </div>;
  }
});

module.exports = TimeScrubber;
