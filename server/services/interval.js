const redis = require('redis');

const redisClient = require('services/redis')();

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
  const total = await redisClient.getAsync(ROBIN_TOTAL);
  const value = await redisClient.getAsync(ROBIN_ROTATE);
  const rotateId = (value || 0) + 1;

  redisClient.setAsync(ROBIN_ROTATE, rotateId % total);
  publisher.publishEvent(`${INTERVAL_CREATE}-${rotateId}`, { sessionId });
};

const reassignInterval = async (managerId, userId) => {
  const id = await redisClient.getAsync(redisClient.robinQuery({ managerId }));

  if (id !== null) {
    publisher.publishEvent(`${INTERVAL_REASSIGN}-${id}`, { managerId, userId });
  }
};

module.exports = {
  createInterval,
  reassignInterval,
};
