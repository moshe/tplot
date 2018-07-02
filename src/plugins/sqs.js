const BasicGrid = require('../mainGrid');
const AWS = require('aws-sdk');

const ALLOWED_METRICS = [
  'ApproximateNumberOfMessages',
  'ApproximateNumberOfMessagesNotVisible',
  'ApproximateNumberOfMessagesDelayed',
];

module.exports = (program) => {
  program
    .command('sqs <QueueName>')
    .description('Monitor sqs size')
    .option('-i, --pollingInterval [n]', 'Set the polling interval', 50)
    .option('-r, --region [name]', 'Specify region (default us-east-1)', 'us-east-1')
    .option('-m, --metric [name]', `Specify metric to monitor one of: \n\t${ALLOWED_METRICS.join('\n\t')}\n(default ApproximateNumberOfMessages)`, 'ApproximateNumberOfMessages')
    .action(async (QueueName, options) => {
      AWS.config.update({ region: options.region });
      const basicGrid = new BasicGrid(options.parent);
      const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
      const { QueueUrl } = await sqs.getQueueUrl({ QueueName }).promise();
      async function pollCommand() {
        const { Attributes } = await sqs.getQueueAttributes({ QueueUrl, AttributeNames: [options.metric] }).promise();
        basicGrid.handleInput(Attributes[options.metric]);
        setTimeout(pollCommand, options.pollingInterval);
      }
      await pollCommand();
    });
};
