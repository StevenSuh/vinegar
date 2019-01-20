const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 5000;
const WS_PORT = process.env.WS_PORT || 3000;

app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:8080' }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(__dirname + 'client/public'));
}

require('./routes/api')(app);

const httpServer = require('./routes/socket')(app);

httpServer.listen(WS_PORT, function() {
  console.log('Listening on localhost:3000');
});

app.listen(PORT);
