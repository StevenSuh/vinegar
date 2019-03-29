const redis = require('redis');
const redisClient= require('services/redis');

const {
  WORKER_INVALID,
  WORKER_ROTATE,
  WORKER_TOTAL,
} = require('defs');
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

const createPdf = async (uuid, content) => {
  const total = parseInt(await redisClient.getAsync(WORKER_TOTAL) || 0, 10);
  if (total === 0) {
    throw new Error('There are no worker services running.');
  }

  let workerId = parseInt(await redisClient.incrAsync(WORKER_ROTATE), 10);
  let isInvalid = await redisClient.sismemberAsync(WORKER_INVALID, workerId);

  while (workerId <= total && isInvalid) {
    workerId = parseInt(await redisClient.incrAsync(WORKER_ROTATE), 10);
    isInvalid = await redisClient.sismemberAsync(WORKER_INVALID, workerId);
  }

  if (workerId > total) {
    redisClient.setAsync(WORKER_ROTATE, 0);
    throw new Error('Pdf service is not available');
  } else {
    redisClient.setAsync(WORKER_ROTATE, workerId % total);
  }

  console.log('createPdf:', workerId);
  publisher.publishEvent(PDF_CREATE, { content, uuid, workerId });
};

module.exports = {
  createPdf,
};
