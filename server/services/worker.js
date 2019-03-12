const redis = require('redis');
const redisClient= require('services/redis');

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

const createPdf = async (sessionId, uuid) => {
  const total = parseInt(await redisClient.getAsync(WORKER_TOTAL) || 0, 10);
  if (total === 0) {
    throw new Error('There are no worker services running.');
  }
  const workerId = parseInt(await redisClient.incrAsync(WORKER_ROTATE), 10);
  redisClient.setAsync(WORKER_ROTATE, workerId % total);

  console.log('createPdf:', workerId);
  publisher.publishEvent(PDF_CREATE, { sessionId, uuid, workerId });
};

module.exports = {
  createPdf,
};
