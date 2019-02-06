const {
  redisHost,
  redisPort,
} = require('config');
const redis = require('redis');
const bluebird = require('bluebird');

let redisClient = null;

module.exports = () => {
  if (!redisClient) {
    redisClient = bluebird.promisifyAll(
      redis.createClient({
        host: redisHost,
        port: redisPort,
        retry_strategy: () => 1000,
      }),
    );

    // definitions
    redisClient.SESSION_ID = 'sessionId';
    redisClient.SESSION_SCHOOL = 'schoolName';
    redisClient.SESSION_NAME = 'sessionName';
    redisClient.USER_ID = 'userId';
  }
  return redisClient;
};
