'use strict';

const linearRegression = require('./regression');

const config = {
  startTime: undefined,
  xAxis: undefined,
  regressionPoints: undefined,
};

function init (startTime, xAxis, regressionPoints) {
  config.startTime = startTime;
  config.xAxis = xAxis;
  config.regressionPoints = regressionPoints;
}

class Line {
  constructor() {
    this.points = config.xAxis.map(() => ({
      x: config.startTime,
      y: undefined,
    }));
    this.totalPointsCount = 0;
    this.max = 0;
    this.sum = 0;
    this.min = Infinity;
    this.startTime = Date.now();
  }

  getHistogram() {
    return {
      x: config.xAxis,
      y: this.points.map(p => p.y),
    };
  }

  update(x, y) {
    this.points.push({ x, y });
    this.points.shift();

    this.max = Math.max(this.max, y);
    this.min = Math.min(this.min, y);
    this.sum += y;
    this.totalPointsCount += 1;
    this.avg = parseInt(this.sum / this.totalPointsCount, 10);
    this.duration = parseInt((Date.now() - this.startTime) / 1000);
  }

  calcInsights() {
    const pointsCount = this.points.length
    const prevWindow = this.points.slice(pointsCount - (config.regressionPoints * 2), -config.regressionPoints);
    const prevWindowTimePoints = prevWindow.map(p => parseInt(p.x.getTime(), 10));
    const prevWindowTime = Math.max(...prevWindowTimePoints) - Math.min(...prevWindowTimePoints);
    this.regression = linearRegression([...Array(prevWindow.length)], prevWindow.map(p => p.y));

    // Use gain only if corralates
    this.trend = this.regression.correlation > 0.5 ? this.regression.gain : 0;
    this.shape = this.regression.correlation > 0.5 ? 'Linear' : 'Non linear';
    this.throughput = (prevWindow.length * this.trend) / (prevWindowTime / 1000);
    const lastY = this.points[this.points.length - 1].y;
    if (this.shape === 'Linear') {
      if (this.throughput < 0 && lastY < program.goal) {
        this.timeToGoal = 'Infinity';
      } else if (this.throughput < 0 && last > program.goal) {
        this.timeToGoal = `${Math.abs(last / this.throughput).toFixed(2)}s`;
      } else if (this.throughput > 0 && last > program.goal) {
        this.timeToGoal = '0s (goal is passed)';
      } else if (this.throughput > 0 && last < program.goal) {
        this.timeToGoal = `${Math.abs(last / this.throughput).toFixed(2)}s`;
      }
    } else {
      this.timeToGoal = 'Unknown';
    }
  }
}

module.exports = {
  init,
  Line,
};
