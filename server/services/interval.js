const redis = require('redis');

const redisClient = require('services/redis');

const { ROBIN_ROTATE, ROBIN_TOTAL } = require('defs');
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

const createInterval = async (sessionId) => {
  const total = parseInt(await redisClient.getAsync(ROBIN_TOTAL), 10);
  const robinId = parseInt(await redisClient.incrAsync(ROBIN_ROTATE), 10);

  redisClient.setAsync(ROBIN_ROTATE, robinId % total);
  publisher.publishEvent(INTERVAL_CREATE, { robinId, sessionId });
};

const createExistingInterval = async (sessionId) => {
  const robinId = parseInt(await redisClient.getAsync(redisClient.robinQuery({ sessionId })), 10);

  if (robinId === null) {
    await createInterval(sessionId);
  }
};

const reassignInterval = async (sessionId, userId) => {
  const robinId = parseInt(await redisClient.getAsync(redisClient.robinQuery({ sessionId })), 10);

  if (robinId !== null) {
    publisher.publishEvent(INTERVAL_REASSIGN, { sessionId, robinId, userId });
  }
};

module.exports = {
  createInterval,
  createExistingInterval,
  reassignInterval,
};
