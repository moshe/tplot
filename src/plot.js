#!/usr/bin/env node
const readline = require('readline');
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const program = require('commander');
const linearRegression = require('./regression');
const spawn = require('child_process').spawn;

program
  .version('0.1.3')
  .option('-t, --title [title]', 'Set the title', 'Line')
  .option('-c, --command [command]', 'Set command to watch and plot', 'Line')
  .option('-i, --pollingInterval [n]', 'Set the polling interval for to command argument', 50)
  .option('-p, --points [n]', 'Set the maximum number of points to show in the screen (default:100)', 200)
  .option('-g, --goal [n]', 'If looking at an linear line, set the goal you wish the line will get (default:0)', 0)
  .option('-r, --regressionPoints [n]', 'Set the numbers of points to collect in order to calculate the throughput (default:16)', 16)
  .parse(process.argv);

const screen = blessed.screen();
const start = new Date();
program.points = parseInt(program.points, 10);
program.regressionPoints = parseInt(program.regressionPoints, 10);

const lastNPoints = Array.from(Array(program.points).keys()).map(() => ({ num: undefined, at: start }));
const stats = { points: 0, max: 0, sum: 0, min: Infinity };

/* eslint new-cap: ["error", { "newIsCap": false }] */
const grid = new contrib.grid({ rows: 5, cols: 5, screen });

const line = grid.set(0, 0, 5, 4, contrib.line, {
  style: {
    line: 'white',
    text: 'blue',
  },
  label: program.title,
});

const log = grid.set(0, 4, 2, 1, contrib.log, { fg: 'white', label: 'Statistics' });

const points = grid.set(2, 4, 3, 1, contrib.log, { fg: 'green', label: 'Inputs' });

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
  const prevWindow = lastNPoints.slice(lastNPoints.length - (program.regressionPoints * 2), -program.regressionPoints);
  const prevWindowTime = Math.max(...prevWindow.map(x => parseInt(x.at.getTime(), 10))) - Math.min(...prevWindow.map(x => parseInt(x.at.getTime(), 10)));
  const regression = linearRegression(Array.from(Array(prevWindow.length).keys()), prevWindow.map(x => x.num));

  // Use gain only if corralates
  stats.trend = regression.correlation > 0.5 ? regression.gain : 0;
  stats.shape = regression.correlation > 0.5 ? 'Linear' : 'Non linear';
  stats.throughput = (prevWindow.length * stats.trend) / (prevWindowTime / 1000);
  if (stats.shape === 'Linear') {
    if (stats.throughput < 0 && num < program.goal) {
      stats.timeToGoal = 'Infinity';
    } else if (stats.throughput < 0 && num > program.goal) {
      stats.timeToGoal = `${Math.abs(num / stats.throughput).toFixed(2)}s`;
    } else if (stats.throughput > 0 && num > program.goal) {
      stats.timeToGoal = '0s (goal is passed)';
    } else if (stats.throughput > 0 && num < program.goal) {
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
    `Time to ${program.goal}: ${stats.timeToGoal}`,
  ]);
  plot();
}

// Command handler
function pollCommand() {
  const command = spawn(program.command, { shell: true });
  command.stdout.on('data', (data) => {
    handleInput(data);
    setTimeout(() => {
      pollCommand();
    }, program.pollingInterval);
  });
}
if (program.command) {
  pollCommand();
}

// Stdin handler
rl.on('line', (input) => {
  handleInput(input);
});
