const main = require('../mainGrid');
const readline = require('readline');

module.exports = (program) => {
  program
    .command('stdin')
    .alias('s')
    .description('Monitor stdin')
    .action((options) => {
      const handleInput = main(options.parent);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      });

      rl.on('line', (input) => {
        handleInput(input);
      });
    });
};
