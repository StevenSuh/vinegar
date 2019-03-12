/* eslint no-param-reassign: 0 */
const redis = require('redis');
const { checkAsync, tryCatch } = require('utils');
const { SUBSCRIBE_EVENTS } = require('./defs');
const { socketLogger } = require('./utils');

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
  const validCbs = wsCallbacks.filter(item => item.channel === channel);

  if (validCbs.length > 0) {
    const data = tryCatch(() => JSON.parse(message));
    const type = data._type;

    validCbs.forEach(({ cb }) => {
      const start = Date.now();

      if (checkAsync(cb)) {
        cb(data).then(() =>
          socketLogger(
            { type: type || channel },
            { sessions: ['redis'] }),
            Date.now() - start,
          );
      } else {
        cb(data);
        socketLogger(
          { type: type || channel },
          { sessions: ['redis'] },
          Date.now() - start,
        );
      }
    });
  }
});

wsRedisSub.subscribe(...Object.values(SUBSCRIBE_EVENTS));

module.exports = {
  addWsCallback,
  wsRedisPub,
  wsRedisSub,
};
