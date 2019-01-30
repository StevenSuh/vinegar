const express = require('express');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fs = require('fs');

const config = require('config');
const configTemplate = require('config_template');

if (process.env.NODE_ENV !== 'production') {
  if (!fs.existsSync('./config.js')) {
    throw new Error(
      'Your config.js does not exist. Get the file from owners of this repo.'
    );
  }

  Object.keys(configTemplate).forEach(key => {
    if (!config[key]) {
      throw new Error(`Your config.js is missing ${key} property.`);
    }
  });
}

const app = express();

const PORT = process.env.PORT || 5000;
const WS_PORT = process.env.WS_PORT || 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

if (process.env.NODE_ENV === 'production') {
  app.use(cors({credentials: true, origin: true}));
  app.use(express.static(`${__dirname}client/public`));
} else {
  app.use(cors({credentials: true, origin: 'http://localhost:8080'}));
}

require('./routes/api')(app);
require('./db')();

const httpServer = require('./routes/socket')(app);

httpServer.listen(WS_PORT);
app.listen(PORT);
