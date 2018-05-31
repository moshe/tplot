#!/usr/bin/env node

const readline = require('readline');
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const program = require('commander');
const spawn = require('child_process').spawn;
const graph = require('./line')

const DEFAULT_POINTS = 200

program
  .version('0.1.3')
  .option('-t, --title [title]', 'Set the title', 'Line')
  .option('-c, --command [command]', 'Set command to watch and plot', 'Line')
  .option('-i, --pollingInterval [n]', 'Set the polling interval for to command argument', 50)
  .option('-p, --points [n]', `Set the maximum number of points to show in the screen (default: ${DEFAULT_POINTS})`, DEFAULT_POINTS)
  .option('-g, --goal [n]', 'If looking at an linear line, set the goal you wish the line will get (default:0)', 0)
  .option('-r, --regressionPoints [n]', 'Set the numbers of points to collect in order to calculate the throughput (default:16)', 16)
  .parse(process.argv);

const screen = blessed.screen();
const start = new Date();

program.points = parseInt(program.points, 10);
program.regressionPoints = parseInt(program.regressionPoints, 10);

const xAxis = [...Array(program.points).keys()]
graph.init(
  start,
  xAxis,
  program.regressionPoints,
);

graphs = {};
var selectedGraph = undefined;

/* eslint new-cap: ["error", { "newIsCap": false }] */
const grid = new contrib.grid({ rows: 5, cols: 5, screen });

const line = grid.set(0, 0, 5, 4, contrib.line, {
  style: {
    line: 'white',
    text: 'blue',
  },
  label: program.title,
});

const statsPane = grid.set(0, 4, 2, 1, contrib.log, { fg: 'white', label: 'Statistics' });

const pointsPane = grid.set(2, 4, 3, 1, contrib.log, { fg: 'green', label: 'Inputs' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const plot = () => {
  line.setData(Object.keys(graphs).map((k) => graphs[k].getHistogram()));
  screen.render();
};

function getHumanReadableSeconds(seconds) {
  var amount = seconds;
  var unit = 's';

  if (amount > 60) {
    amount /= 60;
    unit = 'm';
    if (amount > 60) {
      amount /= 60;
      unit = 'h';
      if (amount > 24) {
        amount /= 24;
        unit = 'days'
      }
    }
  }


  return `${amount}${unit}`
}

function getStatsData(graph) {
  graph.calcInsights();
  return [
    `Max: ${graph.max}`,
    `Min: ${graph.min}`,
    `Average: ${graph.avg}`,
    `Duration: ${getHumanReadableSeconds(graph.duration)}`,
    `Points collected: ${graph.totalPointsCount}`,
    `Shape: ${graph.shape}`,
    `Throughput: ${graph.throughput.toFixed(2)}/s`,
    `Time to ${program.goal}: ${graph.timeToGoal}`,
  ];
}

function parseInput(input) {
  if (isNaN(input)) {
     return JSON.parse(input);
  } else {
    return {'unnamed': parseFloat(input)};
  }
}

function handleInput(input) {
  const parsedInput = parseInput(input);
  const now = new Date();
  pointsPane.log(`${now.toTimeString().split(' ')[0]}: ${input}`);

  Object.keys(parsedInput).map(k => {
    if (graphs[k] === undefined) {
      graphs[k] = new graph.Line();
      if (selectedGraph === undefined) {
        selectedGraph = k
      }
    }
  })

  Object.keys(graphs).map(k => {
    graphs[k].update(now, parsedInput[k]);
  })

  if (selectedGraph !== undefined) {
    statsPane.setItems(getStatsData(graphs[selectedGraph]));
  }
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
