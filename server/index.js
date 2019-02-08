const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { customMorgan, enableResBody } = require('utils');

const app = express();

const PORT = process.env.PORT || 5000;
const WS_PORT = process.env.WS_PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(enableResBody);
app.use(customMorgan());

require('./routes/api')(app);
require('./db')();
require('./services/redis')();

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(`${__dirname}client/public`));
}
app.disable('etag');

const httpServer = require('./routes/socket')(app);

httpServer.listen(WS_PORT);
app.listen(PORT);
