var Header = require('./header'),
    createTimeRangeController = require('../timeRangeController');

module.exports = React.createClass({
  render: function(){
    var timeRangeController = createTimeRangeController();

    return <main>
      <Header timeRangeController={timeRangeController} eventBus={this.props.eventBus} timeRange={this.props.timeRange}/>
      {this.props.content}
      <footer>
        <div className="credits">
          microscope logo <a href="https://thenounproject.com/term/microscope/70197/">created by Jetro Cabau Quirós</a>
        </div>
      </footer>
    </main>;
  }
});

