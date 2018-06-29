#!/usr/bin/env node
const program = require('commander');
const cmdPoller = require('./pollers/cmdPoller');
const stdinPoller = require('./pollers/stdinPoller');
const redisPoller = require('./pollers/redisPoller');

program
  .version(require('../package.json').version)
  .option('-t, --title [title]', 'Set the title', 'Line')
  .option('-p, --points [n]', 'Set the maximum number of points to show in the screen (default:100)', 200)
  .option('-g, --goal [n]', 'If looking at an linear line, set the goal you wish the line will get (default:0)', 0)
  .option('-r, --regressionPoints [n]', 'Set the numbers of points to collect in order to calculate the throughput (default:16)', 16);

cmdPoller(program);
stdinPoller(program);
redisPoller(program);

program.parse(process.argv);
