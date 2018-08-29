const BasicGrid = require('../mainGrid');
const redis = require('redis');

module.exports = (program) => {
  program
    .command('redis <list>')
    .description('Monitor redis list length')
    .alias('r')
    .option('-i, --pollingInterval [n]', 'Set the polling interval', 50)
    .option('-h, --host [name]', 'Connect to remote host', 'localhost')
    .option('-t, --enableTLS', 'Set up a TLS connection to Redis', false)
    .action((list, options) => {
      const client = redis.createClient({ host: options.host, tls: options.enableTLS });
      const basicGrid = new BasicGrid(options.parent);

      function pollCommand() {
        client.llen(list, (err, data) => {
          basicGrid.handleInput(data);
          setTimeout(() => {
            pollCommand();
          }, options.pollingInterval);
        });
      }
      pollCommand();
    });
};
