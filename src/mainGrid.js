/* eslint-disable no-param-reassign */
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const RegressionLog = require('./components/regressionLog');

class BasicGrid {
  constructor(options) {
    this.start = new Date()
    options.points = parseInt(options.points, 10);
    options.regressionPoints = parseInt(options.regressionPoints, 10);
    this.options = options;
    this.screen = blessed.screen();
    this.lastNPoints = Array.from(Array(options.points).keys()).map(() => ({ num: undefined, at: this.start }));

    // Layout
    // eslint-disable-next-line new-cap
    this.grid = new contrib.grid({ rows: 5, cols: 5, screen: this.screen });
    this.line = this.grid.set(0, 0, 5, 4, contrib.line, {
      style: { line: 'white', text: 'blue' },
      label: this.options.title,
    });
    const log = this.grid.set(0, 4, 2, 1, contrib.log, { fg: 'white', label: 'Statistics' });
    this.regressionLog = new RegressionLog(this.options, log);
    this.points = this.grid.set(2, 4, 3, 1, contrib.log, { fg: 'green', label: 'Inputs' });
  }
  handleInput(input) {
    const num = parseFloat(input);
    const now = new Date();
    this.points.log(`${now.toTimeString().split(' ')[0]}: ${input}`);

    // Update the stack
    this.lastNPoints.push({ num, at: now });
    this.lastNPoints.shift();

    this.regressionLog.updateMetrics(num);
    this.plot();
  }
  plot() {
    const histogram = {
      x: Array.from(Array(this.options.points).keys()),
      y: this.lastNPoints.map(x => x.num),
    };
    this.line.setData([histogram]);
    this.screen.render();
  }
  static abort(error) {
    throw new Error(error);
  }
}
module.exports = BasicGrid;
