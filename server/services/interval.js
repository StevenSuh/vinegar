const redis = require('redis');

const { INTERVAL_CREATE, INTERVAL_REASSIGN } = require('routes/socket/defs');

const publisher = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  retry_strategy: () => 1000,
});

publisher.publishEvent = (type, data) => {
  if (typeof data !== 'object') {
    throw new Error('Invalid data type.');
  }
  publisher.publish(type, JSON.stringify(data));
};

const createInterval = (sessionId) => {
  publisher.publishEvent(INTERVAL_CREATE, { sessionId });
};

const reassignInterval = (managerId, userId) => {
  publisher.publishEvent(INTERVAL_REASSIGN, { managerId, userId });
};

module.exports = {
  createInterval,
  reassignInterval,
};
