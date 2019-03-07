const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const http = require('http');

const RateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const redisClient = require('services/redis');

const { customMorgan, enableResBody } = require('utils');

const app = express();

const PORT = process.env.PORT || 5000;
const WS_PORT = process.env.WS_PORT || 3000;

const limiter = new RateLimit({
  store: new RedisStore({ client: redisClient }),
  max: 100,
  windowMs: 1000 * 60 * 10, // 10 minutes
});

app.use(bodyParser.json());
app.use(cookieParser());
app.use(enableResBody);
app.use(customMorgan());
app.use(limiter);

require('routes/api')(app);
require('db');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(`${__dirname}client/public`));
}
app.disable('etag');

const httpServer = new http.Server();
require('routes/socket')(httpServer);

httpServer.listen(WS_PORT);
app.listen(PORT);
