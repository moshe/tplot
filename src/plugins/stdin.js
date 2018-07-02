const BasicGrid = require('../mainGrid');
const readline = require('readline');

module.exports = (program) => {
  program
    .command('stdin')
    .alias('s')
    .description('Monitor stdin')
    .action((options) => {
      const basicGrid = new BasicGrid(options.parent);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      });

      rl.on('line', (input) => {
        basicGrid.handleInput(input);
      });
    });
};
