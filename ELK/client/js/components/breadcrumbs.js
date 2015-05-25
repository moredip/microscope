var _ = require('underscore');

module.exports = React.createClass({
  render: function(){
    var els = _.map( this.props.crumbs, function(crumb){
      var label = crumb[0];
      var link = crumb[1] || "javascript:void(0)";
      return <a href={link}>{label}</a>;
    });

    return <div className="breadcrumb">
      {els}
    </div>
  }
});

