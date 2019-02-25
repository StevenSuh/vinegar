const {
  redisHost,
  redisPort,
} = require('config');
const redis = require('redis');
const bluebird = require('bluebird');

const {
  INTERVAL_CREATE,
  REDIS_SOCKET,
  ROBIN_ROTATE,
  ROBIN_TOTAL,
} = require('defs');

const { tryCatch } = require('utils');

const callbacks = [];
const roundRobinDefs = [INTERVAL_CREATE];

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

redisClient.SESSION_SCHOOL = 'schoolName';
redisClient.SESSION_NAME = 'sessionName';

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

const calculateCurrentRobin = async (client) => {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  const hasRobinId = Boolean(client.robinId);
  const totalRobinExists = await redisClient.existsAsync(ROBIN_TOTAL);

  // total
  let totalRobin = 1;
  if (totalRobinExists) {
    const incr = hasRobinId ? 0 : 1;
    totalRobin = await redisClient.getAsync(ROBIN_TOTAL) + incr;
  }
  if (!hasRobinId) {
    client.robinId = totalRobin;
    await redisClient.incrAsync(ROBIN_TOTAL);
  }

  // rotate
  let rotateRobin = 1;
  if (totalRobinExists) {
    rotateRobin = await redisClient.getAsync(ROBIN_ROTATE);
  }

  if (client.robinId === rotateRobin) {
    await redisClient.setAsync(ROBIN_ROTATE, (rotateRobin + 1) % totalRobin);
    return true;
  }
  return false;
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
  if (roundRobinDefs.includes(channel)) {
    const shouldProceed = await calculateCurrentRobin(this);
    if (!shouldProceed) {
      return;
    }
  }

  const validCbs = callbacks.filter(item => item.channel === channel);

  if (validCbs.length > 0) {
    const data = tryCatch(() => JSON.parse(message));

    for (let i = 0; i < validCbs.length; i += 1) {
      const { cb } = validCbs[i];
      cb(data);
    }
  }
}.bind(subscriber));

module.exports = {
  addCallback,
  redisClient,
  publisher,
  subscriber,
};

