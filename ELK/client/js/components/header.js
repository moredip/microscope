var _ = require('underscore');

module.exports = React.createClass({
  render: function(){
    return <header>
      <form className="header-filter">
        <input type="search"></input>
        <button type="submit">Filter</button>
      </form>
    </header>;
  }
});
