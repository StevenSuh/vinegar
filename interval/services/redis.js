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

const calculateCurrentRobin = async (client) => {
  const hasRobinId = Boolean(client.robinId);
  const totalRobinExists = await client.existsAsync(ROBIN_TOTAL);

  // total
  let totalRobin = 1;
  if (totalRobinExists) {
    const incr = hasRobinId ? 0 : 1;
    totalRobin = await client.getAsync(ROBIN_TOTAL) + incr;
  }
  if (!hasRobinId) {
    client.robinId = totalRobin;
    await client.incrAsync(ROBIN_TOTAL);
  }

  // rotate
  let rotateRobin = 1;
  if (totalRobinExists) {
    rotateRobin = await client.getAsync(ROBIN_ROTATE);
  }
  if (client.robinId === rotateRobin) {
    await client.setAsync(ROBIN_ROTATE, (rotateRobin + 1) % totalRobin);
    return true;
  }
  return false;
};

const onMessage = async function(channel, message) {
  const validCbs = callbacks.filter(item => item.channel === channel);

  if (validCbs.length > 0) {
    const data = tryCatch(() => JSON.parse(message));

    for (let i = 0; i < validCbs.length; i += 1) {
      const { channel, cb } = validCbs[i];

      if (roundRobinDefs.includes(channel)) {
        const shouldProceed = await calculateCurrentRobin(this);

        if (!shouldProceed) {
          return;
        }
      }
      cb(data);
    }
  }
};

const publishCheck = function(type, data) {
  if (typeof data !== 'object') {
    throw new Error('Invalid data type.');
  }
  this.publish(type, JSON.stringify(data));
};

const redisClient = bluebird.promisifyAll(
  redis.createClient({
    host: redisHost,
    port: redisPort,
    retry_strategy: () => 1000,
  }),
);

redisClient.publishCheck = publishCheck.bind(redisClient);
redisClient.on('message', onMessage.bind(redisClient));

redisClient.duplicateClient = ({ pub, sub } = {}) => {
  const duplicate = redisClient.duplicate();
  if (sub) {
    duplicate.on('message', onMessage.bind(duplicate));
  }
  if (pub) {
    duplicate.publishCheck = publishCheck.bind(duplicate);
    duplicate.to = function(target = null) {
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
    }.bind(duplicate);
  }
  return duplicate;
};

module.exports = {
  addCallback,
  redisClient,
};

