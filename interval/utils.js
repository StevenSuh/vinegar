const { redisClient } = require('services/redis');

module.exports = {
  sleep: timeout => new Promise(resolve => setTimeout(resolve, timeout)),
  tryCatch: (fn, errCb) => {
    try {
      return fn();
    } catch (err) {
      if (errCb) {
        return errCb();
      }
      // eslint-disable-next-line no-console
      console.warn(err);
      return null;
    }
  },
  exitHandler: sessions => {
    // do something when app is closing
    const exitFn = () => {
      Object.keys(sessions).forEach(sessionId => {
        const robinQuery = redisClient.robinQuery({ sessionId });
        redisClient.delAsync(robinQuery);
      });
    };

    process.on('exit', exitFn);
    process.on('SIGHUP', exitFn);
    process.on('SIGINT', exitFn);
    process.on('SIGTERM', exitFn);
  },
};
