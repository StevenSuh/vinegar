const express = require('express');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

morgan.token('reqBody', req => JSON.stringify(req.body));
morgan.token('resBody', res => JSON.stringify(res.body));

const app = express();

const PORT = process.env.PORT || 5000;
const WS_PORT = process.env.WS_PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((_req, res, next) => {
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

    const body = JSON.parse(Buffer.concat(chunks).toString('ascii') || '{}');
    res.body = body;

    oldEnd.apply(res, args);
  };
  next();
});
app.use(
  morgan((tokens, req, res) => {
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
  }),
);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(`${__dirname}client/public`));
}

require('./routes/api')(app);
require('./db')();
require('./services/redis')();

const httpServer = require('./routes/socket')(app);

httpServer.listen(WS_PORT);
app.listen(PORT);
