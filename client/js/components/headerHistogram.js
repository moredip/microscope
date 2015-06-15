var _ = require('underscore'),
    translationTransform = require('../helpers/translationTransform');

module.exports = React.createClass({
  displayName: "HeaderHistogram",

  setupBrush: function(){
    var brush = d3.svg.brush().x( this.scales().xLinear );

    brush.extent( _.keys(this.props.data.bins)[50],_.keys(this.props.data.bins)[150] );

    d3.select(this.getDOMNode())
      .select('.brush').call(brush)
      .selectAll('rect').attr('height',this.dims().inner.height)
  },

  setupAxes: function(){
    var xAxis = d3.svg.axis()
      .scale(this.scales().xLinear)
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

    var x = d3.scale.ordinal()
      .domain(timeBins)
      .rangeRoundBands([dims.margin.left, dims.inner.width]);

    var xLinear = d3.time.scale()
      .domain(timeRange)
      .range([dims.margin.left, dims.inner.width]);

    var y = d3.scale.linear()
      .domain([0, _.max(props.data.bins)])
        .range([dims.inner.height,dims.margin.top]);

    return {x:x,xLinear:xLinear,y:y};
  },

  render: function(){
    var dims = this.dims();
    var props = this.props;
    var data = props.data;
    var scales = this.scales();

    //var selection = [];
    //if( this.state.selectionStart && this.state.selectionEnd ){
      //var selectionRange = actuallySort([this.state.selectionStart,this.state.selectionEnd]);

      //selection = <rect x={selectionRange[0]}
          //y={0}
          //width={selectionRange[1]-selectionRange[0]}
          //height={dims.inner.height}
          //className="histogram-selection"
        ///>;
    //}

    //var marker = [];
    //if( this.state.markerLocation ){
      //marker = <line 
        //className="histogram-marker"
        //x1={this.state.markerLocation} x2={this.state.markerLocation}
        //y1={0} y2={dims.inner.height}
      ///>;
    //}

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
            width={scales.x.rangeBand()} 
            height={dims.inner.height-scales.y(count)}
          >
         </rect>
      </g>;
    });

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
      <ul className="last-list">
        <li>last 1h</li>
        <li>last 12h</li>
        <li>last 2d</li>
      </ul>
      <ul className="last-list">
        <li>last 7d</li>
        <li>last 30d</li>
        <li>last 6m</li>
      </ul>
    </div>;
  }
});
