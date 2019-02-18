/* eslint no-param-reassign: 0 */
const redis = require('redis');
const EVENTS = require('./defs');

const wsRedisPub = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
const wsRedisSub = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
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
  const validCbs = wsCallbacks.filter(item => item.channel === channel);

  if (validCbs.length > 0) {
    let data = '';
    try {
      data = JSON.parse(message);
    } catch (_) {
      return;
    }

    validCbs.forEach(({ cb }) => {
      cb(data);
    })
  }
});

wsRedisSub.subscribe(...Object.values(EVENTS));

module.exports = {
  addWsCallback,
  wsRedisPub,
  wsRedisSub,
};
