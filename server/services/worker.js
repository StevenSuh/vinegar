const redis = require('redis');

const redisClient = require('services/redis')();

const { WORKER_ROTATE, WORKER_TOTAL } = require('defs');
const { PDF_CREATE } = require('routes/socket/defs');

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

const createPdf = async (sessionId, style) => {
  const total = parseInt(await redisClient.getAsync(WORKER_TOTAL), 10);
  const workerId = parseInt(await redisClient.incrAsync(WORKER_ROTATE), 10);

  redisClient.setAsync(WORKER_ROTATE, workerId % total);
  publisher.publishEvent(PDF_CREATE, { workerId, sessionId, style });
};

module.exports = {
  createPdf,
};