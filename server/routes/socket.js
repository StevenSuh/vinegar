const cookie = require('cookie');
const http = require('http');
const pathToRegexp = require('path-to-regexp');
const SocketIo = require('socket.io');

const {ALLOWED_CHARACTERS} = require('../defs');

const sessionRegex = pathToRegexp('http://localhost:8080/session/:school/:session');
const characterRegex = new RegExp('^$|^[' + ALLOWED_CHARACTERS.join('') + ']+$');

// helpers
const getSessionName = (socket) => {
  const { referer } = socket.request.headers;
  const sessionParse = sessionRegex.exec(referer);

  if (sessionParse) {
    const sessionName = `${sessionParse[2]}-${sessionParse[3]}`; // TODO

    if (characterRegex.exec(sessionName)) {
      return sessionName;
    }
  }
  return null;
};

const getSessionIdCookie = (socket) => {
  const reqCookie = socket.request.headers.cookie;
  const cookies = cookie.parse(reqCookie);

  return cookies.sessionId;
};

// main
module.exports = (app) => {
  const httpServer = http.Server(app);
  const io = SocketIo(httpServer);

  io.on('connection', function(socket) {
    const sessionName = getSessionName(socket);
    const userId = getSessionIdCookie(socket); // obfuscated

    socket.on('onJoinSession', function() {
      if (sessionName) {
        socket.join(sessionName);
        return;
      }
      socket.emit('exception', {
        errorMessage: 'Could not join a session due to invalid name',
      });
    });

    socket.on('onEditorTextUpdate', function({ data }) {
      socket.broadcast.to(sessionName).emit('onEditorTextUpdate', {data, userId});
    });

    socket.on('onEditorSelectionUpdate', function({ data, name }) {
      socket.broadcast.to(sessionName).emit('onEditorSelectionUpdate', {data, name, userId});
    });

    socket.on('onEditorSelectionRemove', function() {
      socket.broadcast.to(sessionName).emit('onEditorSelectionRemove', {userId});
    });
  });

  return httpServer;
};
