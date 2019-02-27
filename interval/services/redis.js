const {
  redisHost,
  redisPort,
} = require('config');
const redis = require('redis');
const bluebird = require('bluebird');

const { REDIS_SOCKET, ROBIN_TOTAL } = require('defs');

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

redisClient.incrAsync(ROBIN_TOTAL).then(index => {
  redisClient.robinId = index;
});

redisClient.ROBIN_MANAGER = 'robin-manager';
redisClient.SESSION_SCHOOL = 'schoolName';
redisClient.SESSION_NAME = 'sessionName';

redisClient.robinQuery = ({ managerId }, value) => {
  if (value) {
    return [`${redisClient.ROBIN_MANAGER}-${managerId}`, value];
  }
  return `${redisClient.ROBIN_MANAGER}-${managerId}`;
};
redisClient.sessionSchool = ({ cookieId, sessionId }, value) => {
  const query = [`${redisClient.SESSION_SCHOOL}-${sessionId}`, cookieId];
  if (value) {
    query.push(value);
  }
  return query;
};
redisClient.sessionName = ({ cookieId, sessionId }, value) => {
  const query = [`${redisClient.SESSION_NAME}-${sessionId}`, cookieId];
  if (value) {
    query.push(value);
  }
  return query;
};
redisClient.intervalQuery = ({ sessionId }, value, expiration) =>
  [`${redisClient.INTERVAL}-${sessionId}`, value, 'PX', expiration];

const getRoundRobinId = () =>
  redisClient.robinId;

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
  getRoundRobinId,
  redisClient,
  publisher,
  subscriber,
};

