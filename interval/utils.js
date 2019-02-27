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
  exitHandler: (managers) => {
    // do something when app is closing
    const exitFn = () => {
      redisClient.setAsync('temporary', 100);
      Object.keys(managers).forEach(managerId => {
        const robinQuery = redisClient.robinQuery({ managerId });
        redisClient.delAsync(robinQuery);
      });
    };

    process.on('exit', exitFn);
    process.on('SIGHUP', exitFn);
    process.on('SIGINT', exitFn);
    process.on('SIGTERM', exitFn);
  },
};
