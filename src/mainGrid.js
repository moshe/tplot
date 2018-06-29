/* eslint-disable no-param-reassign */
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const linearRegression = require('./regression');

module.exports = (options) => {
  const screen = blessed.screen();
  const start = new Date();
  options.points = parseInt(options.points, 10);
  options.regressionPoints = parseInt(options.regressionPoints, 10);
  const lastNPoints = Array.from(Array(options.points).keys()).map(() => ({ num: undefined, at: start }));
  const stats = { points: 0, max: 0, sum: 0, min: Infinity };

  /* eslint new-cap: ["error", { "newIsCap": false }] */
  const grid = new contrib.grid({ rows: 5, cols: 5, screen });

  const line = grid.set(0, 0, 5, 4, contrib.line, {
    style: {
      line: 'white',
      text: 'blue',
    },
    label: options.title,
  });

  const log = grid.set(0, 4, 2, 1, contrib.log, { fg: 'white', label: 'Statistics' });

  const points = grid.set(2, 4, 3, 1, contrib.log, { fg: 'green', label: 'Inputs' });

  const plot = () => {
    const histogram = {
      x: Array.from(Array(options.points).keys()),
      y: lastNPoints.map(x => x.num),
    };
    line.setData([histogram]);
    screen.render();
  };

  function handleInput(input) {
    const num = parseFloat(input);
    const now = new Date();
    points.log(`${now.toTimeString().split(' ')[0]}: ${input}`);

    // Update the stack
    lastNPoints.push({ num, at: now });
    lastNPoints.shift();

    // Simple metrics
    stats.max = Math.max(stats.max, num);
    stats.min = Math.min(stats.min, num);
    stats.sum += num;
    stats.points += 1;
    stats.avg = parseInt(stats.sum / stats.points, 10);
    stats.duration = (Date.now() - start.getTime()) / 1000;

    // Get regression data
    const prevWindow = lastNPoints.slice(lastNPoints.length - (options.regressionPoints * 2), -options.regressionPoints);
    const prevWindowTime = Math.max(...prevWindow.map(x => parseInt(x.at.getTime(), 10))) - Math.min(...prevWindow.map(x => parseInt(x.at.getTime(), 10)));
    const regression = linearRegression(Array.from(Array(prevWindow.length).keys()), prevWindow.map(x => x.num));

    // Use gain only if corralates
    stats.trend = regression.correlation > 0.5 ? regression.gain : 0;
    stats.shape = regression.correlation > 0.5 ? 'Linear' : 'Non linear';
    stats.throughput = (prevWindow.length * stats.trend) / (prevWindowTime / 1000);
    if (stats.shape === 'Linear') {
      if (stats.throughput < 0 && num < options.goal) {
        stats.timeToGoal = 'Infinity';
      } else if (stats.throughput < 0 && num > options.goal) {
        stats.timeToGoal = `${Math.abs(num / stats.throughput).toFixed(2)}s`;
      } else if (stats.throughput > 0 && num > options.goal) {
        stats.timeToGoal = '0s (goal is passed)';
      } else if (stats.throughput > 0 && num < options.goal) {
        stats.timeToGoal = `${Math.abs(num / stats.throughput).toFixed(2)}s`;
      }
    } else {
      stats.timeToGoal = 'Unknown';
    }

    // Write the stats panel
    log.setItems([`Max: ${stats.max}`,
      `Min: ${stats.min}`,
      `Average: ${stats.avg}`,
      `Duration: ${stats.duration}s`,
      `Points collected: ${stats.points}`,
      `Shape: ${stats.shape}`,
      `Throughput: ${stats.throughput.toFixed(2)}/s`,
      `Time to ${options.goal}: ${stats.timeToGoal}`,
    ]);
    plot();
  }
  return handleInput;
};
