const express = require('express');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

if (process.env.NODE_ENV !== 'production') {
  const fs = require('fs');

  if (!fs.existsSync('./config.js')) {
    throw new Error('Your config.js does not exist. Get the file from owners of this repo else this project will not be able to run');
  }

  const configTemplate = require('./config_tempalte');
  const config = require('./config');

  for (let key in configTemplate) {
    if (!config[key]) {
      throw new Error(`Your config.js is missing ${key} property`);
    }
  }
}

const app = express();

const PORT = process.env.PORT || 5000;
const WS_PORT = process.env.WS_PORT || 3000;

app.use(bodyParser.json());
app.use(cookieParser());

if (process.env.NODE_ENV === 'production') {
  app.use(cors({credentials: true, origin: true}));
  app.use(express.static(__dirname + 'client/public'));
} else {
  app.use(cors({credentials: true, origin: 'http://localhost:8080'}));
}

require('./routes/api')(app);
require('./db')();

const httpServer = require('./routes/socket')(app);

httpServer.listen(WS_PORT, function() {
  console.log('Listening on localhost:3000');
});

app.listen(PORT);
