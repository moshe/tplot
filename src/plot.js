#!/usr/bin/env node
const readline = require('readline');
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const program = require('commander');
const linearRegression = require('./regression');

program
  .version('0.1.0')
  .option('-t, --title [title]', 'Set the title', 'Line')
  .option('-p, --points [n]', 'Set the maximum number of points to show in the screen (default:100)', 100)
  .option('-r, --regressionPoints [n]', 'Set the numbers of points to collect in order to calculate the throughput (default:16)', 16)
  .parse(process.argv);

const screen = blessed.screen();
const start = new Date();
program.points = parseInt(program.points, 10);
program.regressionPoints = parseInt(program.regressionPoints, 10);

const lastNPoints = Array.from(Array(program.points).keys()).map(() => ({ num: 0, at: start }));
const stats = {
  points: 0,
  max: 0,
  sum: 0,
  min: Infinity,
};

/* eslint new-cap: ["error", { "newIsCap": false }] */
const grid = new contrib.grid({
  rows: 5,
  cols: 5,
  screen,
});

const line = grid.set(0, 0, 5, 4, contrib.line, {
  style: {
    line: 'yellow',
    text: 'green',
    baseline: 'black',
  },
  xLabelPadding: 3,
  xPadding: 5,
  label: program.title,
});

const log = grid.set(0, 4, 2, 1, contrib.log, {
  fg: 'green',
  selectedFg: 'green',
  label: 'Statistics',
});

const points = grid.set(2, 4, 3, 1, contrib.log, {
  fg: 'green',
  selectedFg: 'green',
  label: 'Inputs',
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const plot = () => {
  const histogram = {
    x: Array.from(Array(program.points).keys()),
    y: lastNPoints.map(x => x.num),
  };
  line.setData([histogram]);
  screen.render();
};

rl.on('line', (input) => {
  const num = parseFloat(input);
  const now = new Date();
  points.log(`${now.toISOString()}: ${input}`);

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
  const prevWindow = lastNPoints.slice(lastNPoints.length - (program.regressionPoints * 2), -program.regressionPoints);
  const prevWindowTime = Math.max(...prevWindow.map(x => parseInt(x.at.getTime(), 10))) - Math.min(...prevWindow.map(x => parseInt(x.at.getTime(), 10)));
  const regression = linearRegression(Array.from(Array(prevWindow.length).keys()), prevWindow.map(x => x.num));

  // Use gain only if corralates
  stats.trend = regression.correlation > 0.5 ? regression.gain : 0;
  stats.shape = regression.correlation > 0.5 ? 'Linear' : 'Non linear';
  stats.throughput = (prevWindow.length * stats.trend) / (prevWindowTime / 1000);

  // Write the stats panel
  log.setItems([`Max: ${stats.max}`,
    `Min: ${stats.min}`,
    `Average: ${stats.avg}`,
    `Duration: ${stats.duration}s`,
    `Points collected: ${stats.points}`,
    `Shape: ${stats.shape}`,
    `Throughput: ${stats.throughput.toFixed(2)}/s`,
  ]);
  plot();
});
