const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/public'));

  const path = require('path');

  app.get('*', (req, res) => {
    result.sendFile(path.resolve(__dirname, 'client', 'public', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);

