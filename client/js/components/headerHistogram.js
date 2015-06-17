var _ = require('underscore'),
    moment = require('moment'),
    translationTransform = require('../helpers/translationTransform');

var LastListItem = React.createClass({
  handleClick: function(){
    this.props.onClick(this.props.duration);
  },
  render: function(){
    return <li onClick={this.handleClick}>{this.props.label}</li>;
  }
});

var LastList = React.createClass({
  render: function(){
    return <div className="last-list">
      <ul>
        <LastListItem onClick={this.props.onDurationSelected} label={"last 1h"} duration={{hours:1}}/>
        <LastListItem onClick={this.props.onDurationSelected} label={"last 2h"} duration={{hours:2}}/>
        <LastListItem onClick={this.props.onDurationSelected} label={"last 12h"} duration={{hours:12}}/>
      </ul>
      <ul>
        <LastListItem onClick={this.props.onDurationSelected} label={"last 7d"} duration={{days:7}}/>
        <LastListItem onClick={this.props.onDurationSelected} label={"last 30d"} duration={{days:30}}/>
        <LastListItem onClick={this.props.onDurationSelected} label={"last 6m"} duration={{months:6}}/>
      </ul>
    </div>;
  }
});

module.exports = React.createClass({
  displayName: "HeaderHistogram",

  handleBrushEnd: function(b){
    this.props.timeRangeController.setTimeRange(b.extent());
  },

  setupBrush: function(){
    var that = this;

    var brush = d3.svg.brush().x( this.scales().x );
    
    brush.on( 'brushend', function(){
      that.handleBrushEnd(brush);
    });

    d3.select(this.getDOMNode())
      .select('.brush').call(brush)
      .selectAll('rect').attr('height',this.dims().inner.height)
  },

  setupAxes: function(){
    var xAxis = d3.svg.axis()
      .scale(this.scales().x)
      //.ticks(10)
      .orient("bottom");

    xAxis(d3.select(this.getDOMNode()).select('.x.axis'));
  },

  componentDidMount: function(){
    this.setupBrush();
    this.setupAxes();
  },

  componentDidUpdate: function(){
    this.setupBrush();
    this.setupAxes();
  },

  dims: function(){
    var margin = {top: 5, right: 0, bottom: 12, left: 0},
        full = {width:this.props.width,height:this.props.height},
        inner = {
          width:(full.width - margin.left - margin.right),
          height:(full.height - margin.top - margin.bottom)
        };

    return { margin:margin,full:full,inner:inner };
  },

  scales: function(){
    var dims = this.dims();
    var props = this.props;
    var timeBins = _.map(_.keys(props.data.bins),parseFloat);
    var timeRange = [ _.min(timeBins), _.max(timeBins) ];

    var x = d3.time.scale()
      .domain(timeRange)
      .range([dims.margin.left, dims.inner.width]);

    var y = d3.scale.linear()
      .domain([0, _.max(props.data.bins)])
        .range([dims.inner.height,dims.margin.top]);

    return {x:x,y:y};
  },

  onLastDurationSelected: function(duration){
    this.props.timeRangeController.resetTimeRange(duration);
  },

  render: function(){
    var dims = this.dims();
    var props = this.props;
    var data = props.data;
    var scales = this.scales();

    var barPadding = 2; //pixels

    var bars = undefined;
    if( !_.isEmpty(data.bins) ){
      // gross
      var sampleBinTime = moment( new Date(+_.keys(data.bins)[0]) );
      var nextBinTime = sampleBinTime.clone(); nextBinTime.add(data.resolution);
      var barWidth = scales.x(nextBinTime) - scales.x(sampleBinTime) - barPadding;

      var bars = _.map( data.bins, function(count,timeBin){
        return <g 
            className="bar" 
            key={timeBin}
            transform={translationTransform(scales.x(timeBin),scales.y(count))} 
            data-time={timeBin} 
            data-count={count}
          >
            <rect 
              x="1" 
              width={barWidth} 
              height={dims.inner.height-scales.y(count)}
            >
           </rect>
        </g>;
      });
    }

    // x axis and brush elements are filled out by componentDid[Mount|Update]
    return <div className="header-histogram-container">
      <h3>trace count over time</h3>
      <svg 
        className="histogram"
        width={dims.full.width} 
        height={dims.full.height}
      >
        <g className="brush"></g> 
        <g className="x axis" transform={translationTransform(0,dims.inner.height)}></g> 
        {bars}
      </svg>
      <LastList onDurationSelected={this.onLastDurationSelected}/>
    </div>;
  }
});
