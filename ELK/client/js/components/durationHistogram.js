var _ = require('underscore');

function translationTransform(x,y){
  return "translate("+x+","+y+")";
}

module.exports = React.createClass({

  getInitialState:function(){
    return {};
  },

  dims: function(){
    var margin = {top: 5, right: 0, bottom: 20, left: 0},
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
    var countBuckets = props.data;
    var buckets = _.map(_.keys(countBuckets),parseFloat);

    var x = d3.scale.ordinal()
      .domain(buckets)
      .rangeRoundBands([dims.margin.left, dims.inner.width]);

    var xLinear = d3.scale.linear()
      .domain([ _.min(buckets), _.max(buckets) ])
      .range([dims.margin.left, dims.inner.width]);

    var y = d3.scale.linear()
      .domain([0, _.max(countBuckets)])
        .range([dims.inner.height,dims.margin.top]);

    return {x:x,xLinear:xLinear,y:y};
  },

  generateXAxis: function(){
    var xAxis = d3.svg.axis()
      .scale(this.scales().xLinear)
      .ticks(10)
      .tickFormat(function(d){ return ""+d+"ms"; })
      .orient("bottom");

    xAxis(d3.select(this.getDOMNode()).select('.x.axis'));
  },

  componentDidMount: function(){
    this.generateXAxis();
  },

  markerLocationFromMouseEvent: function(e){
    var chartLocation = this.getDOMNode().getBoundingClientRect();
    return e.clientX - chartLocation.left;
  },

  handleMouseMove: function(e){
    var markerLocation = this.markerLocationFromMouseEvent(e);

    if( 1 === e.buttons ){
      this.setState({selectionEnd:markerLocation});
    }

    this.setState({markerLocation:markerLocation});
  },

  handleMouseDown: function(e){
    var markerLocation = this.markerLocationFromMouseEvent(e);
    this.setState({selectionStart:markerLocation,selectionEnd:markerLocation});
  },

  handleMouseLeave: function(e){
    if( 1 === e.buttons ){
      // abort selection 
      this.setState({selectionStart:undefined,selectionEnd:undefined});
    }
    this.setState({markerLocation:undefined});
  },

  handleMouseUp: function(e){
    if( this.state.selectionStart && this.state.selectionEnd ){
      var x = this.scales().xLinear;
      var selectionInDomainScale = [x.invert(this.state.selectionStart),x.invert(this.state.selectionEnd)].sort();

      if( _.isFunction(this.props.onSelectionChanged) ){
        this.props.onSelectionChanged(selectionInDomainScale);
      }
    }
  },

  render: function(){
    var dims = this.dims();
    var props = this.props;
    var countBuckets = props.data;
    var scales = this.scales();

    var selection = [];
    if( this.state.selectionStart && this.state.selectionEnd ){
      var selectionRange = [this.state.selectionStart,this.state.selectionEnd].sort();
      selection = <rect x={selectionRange[0]}
          y={0}
          width={selectionRange[1]-selectionRange[0]}
          height={dims.inner.height}
          className="histogram-selection"
        />;
    }

    var marker = [];
    if( this.state.markerLocation ){
      marker = <line 
        className="histogram-marker"
        x1={this.state.markerLocation} x2={this.state.markerLocation}
        y1={0} y2={dims.inner.height}
      />;
    }

    var bars = _.map( props.data, function(count,bucket){
      return <g 
          className="bar" 
          key={bucket}
          transform={translationTransform(scales.x(+bucket),scales.y(count))} 
          data-bucket={bucket} 
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
    
    // x axis part is filled out by componentDidUpdate
    return <svg 
      className="histogram"
      width={dims.full.width} 
      height={dims.full.height}
      onMouseMove={this.handleMouseMove}
      onMouseDown={this.handleMouseDown}
      onMouseUp={this.handleMouseUp}
      onMouseLeave={this.handleMouseLeave}
    >
      <g className="x axis" transform={translationTransform(0,dims.inner.height)}></g> 
      {selection}
      {bars}
      {marker}
    </svg>;

  }
});
