const linearRegression = require('../regression');

class RegressionLog {
  constructor(options, log) {
    this.options = options;
    this.log = log;
    this.start = new Date();
    this.lastNPoints = Array.from(Array(options.points).keys()).map(() => ({ num: undefined, at: this.start }));
    this.stats = { points: 0, max: 0, sum: 0, min: Infinity };
  }
  setRegressionStats(num) {
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
        this.stats.timeToGoal = `${Math.abs(this.options.goal / this.stats.throughput).toFixed(2)}s`;
      } else if (this.stats.throughput > 0 && num > this.options.goal) {
        this.stats.timeToGoal = '0s (goal is passed)';
      } else if (this.stats.throughput > 0 && num < this.options.goal) {
        this.stats.timeToGoal = `${Math.abs(this.options.goal / this.stats.throughput).toFixed(2)}s`;
      }
    } else {
      this.stats.timeToGoal = 'Unknown';
    }
  }
  setSimpleMetrics(num) {
    // Simple metrics
    this.stats.max = Math.max(this.stats.max || 0, num);
    this.stats.min = Math.min(this.stats.min || 0, num);
    this.stats.sum += (num || 0);
    this.stats.points += 1;
    this.stats.avg = parseInt(this.stats.sum / this.stats.points, 10);
    this.stats.duration = (Date.now() - this.start.getTime()) / 1000;
  }
  updateLog() {
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
  updateMetrics(metric) {
    const num = parseFloat(metric);
    const now = new Date();
    // Update the stack
    this.lastNPoints.push({ num, at: now });
    this.lastNPoints.shift();

    this.setSimpleMetrics(num);
    this.setRegressionStats(num);
    this.updateLog();
  }
}

module.exports = RegressionLog;
