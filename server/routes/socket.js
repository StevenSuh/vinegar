const cookie = require('cookie');
const http = require('http');
const pathToRegexp = require('path-to-regexp');
const SocketIo = require('socket.io');

const {ALLOWED_CHARACTERS} = require('../defs');

const sessionRegex = pathToRegexp('http://localhost:8080/session/:school/:session');
const characterRegex = new RegExp('^$|^[' + ALLOWED_CHARACTERS.join('') + ']+$');

const dbClient = require('../db')();
const Users = require('../db/UsersModel')(dbClient);
const Sessions = require('../db/SessionsModel')(dbClient);
const Chats = require('../db/chatModel')(dbClient);


// helpers
const getSchoolAndSession = (socket) => {
  const { referer } = socket.request.headers;


  let decodedUrl = null;

  try {
    decodedUrl = decodeURI(referer);
  } catch (err) {
    throw new Error('Invalid url');
  }

  const sessionParse = sessionRegex.exec(decodedUrl);

  // TODO
  return {
    schoolName: sessionParse[2],
    sessionName: sessionParse[3],
  };
};

const getSessionName = (socket) => {
  const { schoolName, sessionName } = getSchoolAndSession(socket);

  if (sessionParse) {
    const session = `${schoolName}-${sessionName}`;

    if (characterRegex.exec(session)) {
      return session;
    }
  }
  return null;
};

const getCookieId = (socket) => {
  const reqCookie = socket.request.headers.cookie;
  const cookies = cookie.parse(reqCookie);

  return cookies.cookieId;
};

// main
module.exports = (app) => {
  const httpServer = http.Server(app);
  const io = SocketIo(httpServer);

  io.on('connection', function(socket) {
    const session = getSessionName(socket);
    const userId = getCookieId(socket); // obfuscated

    socket.on('onJoinSession', function() {
      if (session) {
        socket.join(session);
        return;
      }
      socket.emit('exception', {
        errorMessage: 'Could not join a session due to invalid name',
      });
      return;
    });

    socket.on('onEditorTextUpdate', function({ data }) {
      socket.broadcast.to(session).emit('onEditorTextUpdate', {data, userId});
    });

    socket.on('chatSend', async function(data){

      io.in(sessionName).emit('chatReceive', data)

      console.log(session.sessionId, session.dataValues.id);

      await Chats.create({
        message: data.message,
        sessionId: session.dataValues.id,
        userId: user.dataValues.id,
      })
    })

    socket.on('onEditorSelectionUpdate', function({ data, name }) {
      socket.broadcast.to(session).emit('onEditorSelectionUpdate', {data, name, userId});
    });

    socket.on('onEditorSelectionRemove', function() {
      socket.broadcast.to(session).emit('onEditorSelectionRemove', {userId});
    });
  });

  return httpServer;
};
