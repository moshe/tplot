const BasicGrid = require('../mainGrid');
const spawn = require('child_process').spawn;


module.exports = (program) => {
  program
    .command('cmd <command>')
    .description('Monitor shell command output')
    .alias('c')
    .option('-i, --pollingInterval [n]', 'Set the polling interval for to command argument', 50)
    .action((command, options) => {
      const basicGrid = new BasicGrid(options.parent);

      function pollCommand() {
        const child = spawn(command, { shell: true });
        child.stdout.on('data', (data) => {
          basicGrid.handleInput(data);
          setTimeout(() => {
            pollCommand();
          }, options.pollingInterval);
        });
      }
      pollCommand();
    });
};
