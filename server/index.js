const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 5000;
const WS_PORT = process.env.WS_PORT || 3000;

app.use(bodyParser.json());
app.use(cookieParser());

if (process.env.NODE_ENV === 'production') {
  app.use(cors({ credentials: true, origin: true }));
  app.use(express.static(__dirname + 'client/public'));
} else {
  app.use(cors({ credentials: true, origin: 'http://localhost:8080' }));
}

require('./routes/api')(app);
require('./db')();

const httpServer = require('./routes/socket')(app);

httpServer.listen(WS_PORT, function() {
  console.log('Listening on localhost:3000');
});

app.listen(PORT);
