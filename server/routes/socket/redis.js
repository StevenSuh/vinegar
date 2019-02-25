/* eslint no-param-reassign: 0 */
const redis = require('redis');
const { tryCatch } = require('utils');
const { SUBSCRIBE_EVENTS } = require('./defs');

const wsRedisPub = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  retry_strategy: () => 1000,
});
const wsRedisSub = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  retry_strategy: () => 1000,
});

const wsCallbacks = [];

const addWsCallback = (channel, cb) => {
  wsCallbacks.push({ channel, cb });
};

const redisPubWrapper = (redisClient) => {
  redisClient.publishEvent = (type, data) => {
    if (typeof data !== 'object') {
      throw new Error('Invalid data type.');
    }
    redisClient.publish(type, JSON.stringify(data));
  };
};

redisPubWrapper(wsRedisPub);

wsRedisSub.on('message', (channel, message) => {
  console.log('receiving', channel);

  const validCbs = wsCallbacks.filter(item => item.channel === channel);

  if (validCbs.length > 0) {
    const data = tryCatch(() => JSON.parse(message));

    validCbs.forEach(({ cb }) => {
      cb(data);
    })
  }
});

wsRedisSub.subscribe(...Object.values(SUBSCRIBE_EVENTS));

module.exports = {
  addWsCallback,
  wsRedisPub,
  wsRedisSub,
};
