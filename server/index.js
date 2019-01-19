const express = require('express');
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const app = express();

app.use(bodyParser.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/public'));

  const path = require('path');

  app.get('*', (req, res) => {
    result.sendFile(path.resolve(__dirname, 'client', 'public', 'index.html'));
  });
}

io.on('connection', function(socket) {
  console.log('A user has connected');
});

http.listen(3000, function() {
  console.log('Listening on localhost:3000');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);

