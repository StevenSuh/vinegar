const express = require('express');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const app = express();

const PORT = process.env.PORT || 5000;
const WS_PORT = process.env.WS_PORT || 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(cookieParser());
app.use(morgan('tiny'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(`${__dirname}client/public`));
}

require('./routes/api')(app);
require('./db')();
require('./services/redis')();

const httpServer = require('./routes/socket')(app);

httpServer.listen(WS_PORT);
app.listen(PORT);
