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
const getSessionName = (socket) => {
  const { referer } = socket.request.headers;


  let decodedUrl = null;

  try {
    decodedUrl = decodeURI(referer);
  } catch (err) {
    throw new Error('Invalid url');
  }

  const sessionParse = sessionRegex.exec(decodedUrl);

  if (sessionParse) {
    const sessionName = `${sessionParse[2]}-${sessionParse[3]}`; // TODO

    if (characterRegex.exec(sessionName)) {
      return sessionName;
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

  io.on('connection', async function(socket) {
    const sessionName = getSessionName(socket);
    const cookieId = getCookieId(socket); // obfuscated
    const { referer } = socket.request.headers;
    let decodedUrl = null;

    try {
      decodedUrl = decodeURI(referer);
    } catch (err) {
      throw new Error('Invalid url');
    }
    const sessionParse = sessionRegex.exec(decodedUrl);
    const session = await Sessions.findOne({where: {
      schoolName: sessionParse[2],
      sessionName: sessionParse[3]
    }})
    const user = await Users.findOne({where: {cookieId}})

    if (sessionName) {
      socket.join(sessionName);
    } else {
      socket.emit('exception', {
        errorMessage: 'Could not join a session due to invalid name',
      });
      return;
    }

    socket.on('onEditorTextUpdate', function({ data }) {
      socket.broadcast.to(sessionName).emit('onEditorTextUpdate', {data, cookieId});
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
      socket.broadcast.to(sessionName).emit('onEditorSelectionUpdate', {data, name, cookieId});
    });

    socket.on('onEditorSelectionRemove', function() {
      socket.broadcast.to(sessionName).emit('onEditorSelectionRemove', {cookieId});
    });
  });

  return httpServer;
};
