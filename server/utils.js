const morgan = require('morgan');
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
  deflate: input => {
    return zlib.deflateSync(input).toString('base64');
  },
  inflate: text => {
    if (text) {
      return zlib.inflateSync(Buffer.from(text, 'base64')).toString();
    }
    return text;
  },
  enableResBody: (_req, res, next) => {
    // from https://stackoverflow.com/questions/19215042/express-logging-response-body
    // the `res` obj does not have `body` property unlike `req`
    const oldWrite = res.write;
    const oldEnd = res.end;

    const chunks = [];

    res.write = function newWrite(...args) {
      chunks.push(Buffer.from(args[0]));
      oldWrite.apply(res, args);
    };

    res.end = function newEnd(...args) {
      if (args[0]) {
        chunks.push(Buffer.from(args[0]));
      }

      try {
        const body = JSON.parse(
          Buffer.concat(chunks).toString('ascii') || '{}',
        );
        res.body = body;
      } catch (e) {
        res.body = {};
      }

      oldEnd.apply(res, args);
    };
    next();
  },
  customMorgan: () => {
    morgan.token('reqBody', req => JSON.stringify(req.body));
    morgan.token('resBody', res => JSON.stringify(res.body));

    return morgan((tokens, req, res) => {
      // :method :url :status :res[content-length] - :response-time ms
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms',
        tokens.resBody(req),
        tokens.reqBody(res),
      ].join(' ');
    });
  },
};
