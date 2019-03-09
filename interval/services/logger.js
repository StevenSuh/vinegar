const { Logging } = require('@google-cloud/logging');

const logger = console;

if (process.env.NODE_ENV === 'production') {
  const logging = new Logging();
  const log = logging.log('vinegar-api');
  const metadata = { resource: { type: 'global' } };

  logger.log = (data, type = 'log') =>
    log.write(log.entry(metadata, { type, data }));
  logger.info = (data) =>
    log.write(log.entry(metadata, { type: 'info', data }));
  logger.error = (data) =>
    log.write(log.entry(metadata, { type: 'error', data }));
  logger.warn = (data) =>
    log.write(log.entry(metadata, { type: 'warn', data }));
}

module.exports = logger;
