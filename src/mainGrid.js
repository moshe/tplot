/* eslint-disable no-param-reassign */
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const linearRegression = require('./regression');

class BasicGrid {
  constructor(options) {
    this.start = new Date();
    options.points = parseInt(options.points, 10);
    options.regressionPoints = parseInt(options.regressionPoints, 10);
    this.options = options;
    this.screen = blessed.screen();
    this.lastNPoints = Array.from(Array(options.points).keys()).map(() => ({ num: undefined, at: this.start }));
    this.stats = { points: 0, max: 0, sum: 0, min: Infinity };
    /* eslint new-cap: ["error", { "newIsCap": false }] */
    this.grid = new contrib.grid({ rows: 5, cols: 5, screen: this.screen });

    this.line = this.grid.set(0, 0, 5, 4, contrib.line, {
      style: { line: 'white', text: 'blue' },
      label: this.options.title,
    });
    this.log = this.grid.set(0, 4, 2, 1, contrib.log, { fg: 'white', label: 'Statistics' });
    this.points = this.grid.set(2, 4, 3, 1, contrib.log, { fg: 'green', label: 'Inputs' });
  }
  handleInput(input) {
    const num = parseFloat(input);
    const now = new Date();
    this.points.log(`${now.toTimeString().split(' ')[0]}: ${input}`);

    // Update the stack
    this.lastNPoints.push({ num, at: now });
    this.lastNPoints.shift();

    // Simple metrics
    this.stats.max = Math.max(this.stats.max, num);
    this.stats.min = Math.min(this.stats.min, num);
    this.stats.sum += num;
    this.stats.points += 1;
    this.stats.avg = parseInt(this.stats.sum / this.stats.points, 10);
    this.stats.duration = (Date.now() - this.start.getTime()) / 1000;

    this.setRegressionData(num);
    this.updateStats();
    this.plot();
  }
  setRegressionData(num) {
    // Get regression data
    const prevWindow = this.lastNPoints.slice(this.lastNPoints.length - (this.options.regressionPoints * 2), -this.options.regressionPoints);
    const prevWindowTime = Math.max(...prevWindow.map(x => parseInt(x.at.getTime(), 10))) - Math.min(...prevWindow.map(x => parseInt(x.at.getTime(), 10)));
    const regression = linearRegression(Array.from(Array(prevWindow.length).keys()), prevWindow.map(x => x.num));

    // Use gain only if correlates
    this.stats.trend = regression.correlation > 0.5 ? regression.gain : 0;
    this.stats.shape = regression.correlation > 0.5 ? 'Linear' : 'Non linear';
    this.stats.throughput = (prevWindow.length * this.stats.trend) / (prevWindowTime / 1000);
    if (this.stats.shape === 'Linear') {
      if (this.stats.throughput < 0 && num < this.options.goal) {
        this.stats.timeToGoal = 'Infinity';
      } else if (this.stats.throughput < 0 && num > this.options.goal) {
        this.stats.timeToGoal = `${Math.abs(num / this.stats.throughput).toFixed(2)}s`;
      } else if (this.stats.throughput > 0 && num > this.options.goal) {
        this.stats.timeToGoal = '0s (goal is passed)';
      } else if (this.stats.throughput > 0 && num < this.options.goal) {
        this.stats.timeToGoal = `${Math.abs(num / this.stats.throughput).toFixed(2)}s`;
      }
    } else {
      this.stats.timeToGoal = 'Unknown';
    }
  }
  updateStats() {
    this.log.setItems([`Max: ${this.stats.max}`,
      `Min: ${this.stats.min}`,
      `Average: ${this.stats.avg}`,
      `Duration: ${this.stats.duration}s`,
      `Points collected: ${this.stats.points}`,
      `Shape: ${this.stats.shape}`,
      `Throughput: ${this.stats.throughput.toFixed(2)}/s`,
      `Time to ${this.options.goal}: ${this.stats.timeToGoal}`,
    ]);
  }
  plot() {
    const histogram = {
      x: Array.from(Array(this.options.points).keys()),
      y: this.lastNPoints.map(x => x.num),
    };
    this.line.setData([histogram]);
    this.screen.render();
  }
}
module.exports = BasicGrid;
