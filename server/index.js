const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 5000;
const WS_PORT = process.env.WS_PORT || 3000;

app.use(bodyParser.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/public'));

  const path = require('path');

  app.get('*', (req, res) => {
    result.sendFile(path.resolve(__dirname, 'client', 'public', 'index.html'));
  });
}

const httpServer = require('./routes/socket')(app);

httpServer.listen(WS_PORT, function() {
  console.log('Listening on localhost:3000');
});

app.listen(PORT);
