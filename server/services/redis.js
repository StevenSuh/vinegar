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
    redisClient.ROBIN_MANAGER = 'robin-manager';
    redisClient.SESSION_ID = 'sessionId';
    redisClient.SESSION_SCHOOL = 'schoolName';
    redisClient.SESSION_NAME = 'sessionName';
    redisClient.USER_ID = 'userId';

    redisClient.robinQuery = ({ sessionId }) =>
      `${redisClient.ROBIN_MANAGER}-${sessionId}`;
    redisClient.sessionId = ({ cookieId }, value) => {
      const query = [cookieId, redisClient.SESSION_ID];
      if (value) {
        query.push(value);
      }
      return query;
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
    redisClient.userId = ({ cookieId }, value) => {
      const query = [cookieId, redisClient.USER_ID];
      if (value) {
        query.push(value);
      }
      return query;
    };
  }
  return redisClient;
};
