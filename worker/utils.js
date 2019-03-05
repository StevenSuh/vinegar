const zlib = require('zlib');

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
  inflate: text => {
    if (text) {
      return zlib.inflateSync(Buffer.from(text, 'base64')).toString();
    }
    return text;
  },
};
