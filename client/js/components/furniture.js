var TimeScrubber = require('./TimeScrubber');

module.exports = React.createClass({
  render: function(){
    return <main>
      <header>
        <a href="index.html">
          <img className="logo" src="images/microscope-logo.svg" alt="microscope logo"/>
        </a>
        <h1>MicroScope</h1>
        <TimeScrubber eventBus={this.props.eventBus} timeRange={this.props.timeRange}/>
      </header>
      {this.props.content}
      <footer>
        <div className="credits">
          microscope logo <a href="https://thenounproject.com/term/microscope/70197/">created by Jetro Cabau Quirós</a>
        </div>
      </footer>
    </main>;
  }
});

