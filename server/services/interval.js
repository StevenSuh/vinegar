const redis = require('redis');

const redisClient = require('services/redis');

const { ROBIN_ROTATE, ROBIN_TOTAL } = require('defs');
const { INTERVAL_CREATE, INTERVAL_REASSIGN, INTERVAL_SETUP } = require('routes/socket/defs');

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

const setupInterval = async (sessionId) => {
  const total = parseInt(await redisClient.getAsync(ROBIN_TOTAL) || 0, 10);
  if (total === 0) {
    throw new Error('There are no interval services running.');
  }
  const robinId = parseInt(await redisClient.incrAsync(ROBIN_ROTATE) || 0, 10);
  redisClient.setAsync(ROBIN_ROTATE, robinId % total);

  publisher.publishEvent(INTERVAL_SETUP, { robinId, sessionId });
};

const createInterval = async (sessionId) => {
  const robinId = await redisClient.getAsync(redisClient.robinQuery({ sessionId }));

  if (robinId !== null) {
    publisher.publishEvent(INTERVAL_CREATE, {
      robinId: parseInt(robinId, 10),
      sessionId,
    });
  } else {
    console.error('Session', sessionId, 'has no robinId when createInterval');
  }
};

const createExistingInterval = async (sessionId) => {
  const robinId = await redisClient.getAsync(redisClient.robinQuery({ sessionId }));

  if (robinId === null) {
    await createInterval(sessionId);
  }
};

const reassignInterval = async (sessionId, userId) => {
  const robinId = await redisClient.getAsync(redisClient.robinQuery({ sessionId }));

  if (robinId !== null) {
    publisher.publishEvent(INTERVAL_REASSIGN, {
      sessionId,
      robinId: parseInt(robinId, 10),
      userId,
    });
  } else {
    console.error('Session', sessionId, 'has no robinId when reassignInterval');
  }
};

module.exports = {
  createInterval,
  createExistingInterval,
  reassignInterval,
  setupInterval,
};
