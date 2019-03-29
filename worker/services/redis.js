const {
  redisHost,
  redisPort,
} = require('config');
const redis = require('redis');
const bluebird = require('bluebird');

const { REDIS_SOCKET, WORKER_INVALID, WORKER_TOTAL } = require('defs');

const { tryCatch } = require('utils');

const callbacks = [];

const addCallback = (channel, cb) => {
  callbacks.push({ channel, cb });
};

const redisClient = bluebird.promisifyAll(
  redis.createClient({
    host: redisHost,
    port: redisPort,
    retry_strategy: () => 1000,
  }),
);

const getWorkerId = async () => {
  if (redisClient.workerId !== undefined) {
    return redisClient.workerId;
  }
  const index = parseInt(await redisClient.incrAsync(WORKER_TOTAL), 10);
  await redisClient.sremAsync(WORKER_INVALID, index);
  redisClient.workerId = index;
  console.log('workerId:', redisClient.workerId);
  return index;
};

// publisher
const publisher = redis.createClient({
  host: redisHost,
  port: redisPort,
  retry_strategy: () => 1000,
});

publisher.publishCheck = function(type, data) {
  if (typeof data !== 'object') {
    throw new Error('Invalid data type.');
  }
  this.publish(type, JSON.stringify(data));
}.bind(publisher);

publisher.to = function(target = null) {
  return {
    publishEvent: (type, data = {}) => {
      this.publishCheck(REDIS_SOCKET, {
        ...data,
        _target: target,
        _type: type,
      });
    },
    publishServer: (type, data = {}) => {
      this.publishCheck(type, {
        ...data,
        _target: target,
      });
    },
  }
}.bind(publisher);

// subscriber
const subscriber = redis.createClient({
  host: redisHost,
  port: redisPort,
  retry_strategy: () => 1000,
});

subscriber.on('message', async function(channel, message) {
  const validCbs = callbacks.filter(item => item.channel === channel);

  if (validCbs.length > 0) {
    const data = tryCatch(() => JSON.parse(message));

    for (let i = 0; i < validCbs.length; i += 1) {
      const { cb } = validCbs[i];
      cb(data);
    }
  }
});

module.exports = {
  addCallback,
  getWorkerId,
  redisClient,
  publisher,
  subscriber,
};
