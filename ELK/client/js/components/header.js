var _ = require('underscore');

module.exports = React.createClass({
  handleSubmit: function(e){
    e.preventDefault();
    console.log('filtering with',this.state.filterQuery);

    if( _.isFunction(this.props.onFilterQuery) ){
      this.props.onFilterQuery(this.state.filterQuery);
    }
  },
  handleInputChange: function(e){
    this.setState({filterQuery:e.target.value});
  },
  render: function(){
    return <header>
      <form 
        onSubmit={this.handleSubmit}
        className="header-filter">
        <input onChange={this.handleInputChange} type="search"></input>
        <button type="submit">Filter</button>
      </form>
    </header>;
  }
});
