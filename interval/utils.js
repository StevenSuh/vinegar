module.exports = {
  sleep: (timeout) =>
    new Promise(resolve => setTimeout(resolve, timeout)),
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
};
