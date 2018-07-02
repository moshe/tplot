#!/usr/bin/env node
const program = require('commander');

// Plugins
const cmd = require('./plugins/cmd');
const stding = require('./plugins/stdin');
const redis = require('./plugins/redis');

program
  .version(require('../package.json').version)
  .option('-t, --title [title]', 'Set the title', 'Line')
  .option('-p, --points [n]', 'Set the maximum number of points to show in the screen (default:100)', 200)
  .option('-g, --goal [n]', 'If looking at an linear line, set the goal you wish the line will get (default:0)', 0)
  .option('-r, --regressionPoints [n]', 'Set the numbers of points to collect in order to calculate the throughput (default:16)', 16);

cmd(program);
stding(program);
redis(program);

program.parse(process.argv);
