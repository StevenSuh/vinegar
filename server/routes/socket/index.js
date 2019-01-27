const cookie = require('cookie');
const http = require('http');
const pathToRegexp = require('path-to-regexp');
const SocketIo = require('socket.io');
const SocketRedis = require('socket.io-redis');

const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const sessionRegex = pathToRegexp('http://localhost:8080/session/:school/:session');

// helpers
const getSchoolAndSession = (socket) => {
  const url = socket.request.headers.referer;
  const referer = decodeURI(url);
  const sessionParse = sessionRegex.exec(referer);

  // TODO
  return {
    schoolName: sessionParse[2],
    sessionName: sessionParse[3],
  };
};

const getUserCookieId = (socket) => {
  const reqCookie = socket.request.headers.cookie;
  const cookies = cookie.parse(reqCookie);

  return cookies.userCookieId;
};

const socketInit = (socket, session, user) => {
  socket.join(session.id);
  require('./editor')(socket, session, user);
  // require('./chat')(socket, session, user);
};

// main
module.exports = (app) => {
  const httpServer = http.Server(app);
  const io = SocketIo(httpServer);
  io.adapter(SocketRedis({ host: 'localhost', port: 6379 }));

  io.on('connection', async function(socket) {
    const { schoolName, sessionName } = getSchoolAndSession(socket);
    const userCookieId = getUserCookieId(socket);

    const sessionPromise = Sessions.findActiveBySchoolAndSession({
      attributes: [Sessions.ID, Sessions.PASSWORD, Sessions.SCHOOL_NAME, Sessions.SESSION_NAME],
      schoolName,
      sessionName,
    });
    const userPromise = Users.findOne({
      attributes: [Users.ID],
      where: { cookieId: userCookieId },
    });

    const [session, user] = await Promise.all([sessionPromise, userPromise]);

    if (!user) {
      socket.emit('exception', {
        errorMessage: 'Invalid user',
      });
      return;
    }

    if (session.schoolName === schoolName && session.sessionName === sessionName) {
      // socket.on('onJoinSession', function({ name, phone, password }) {
      //   if (session.password && password !== session.password) {
      //     socket.emit('exception', { errorMessage: 'Invalid password' });
      //     return;
      //   }
      //   if (!name) {
      //     socket.emit('exception', { errorMessage: 'Invalid name' });
      //   }
      //   if (phone) {
      //     // db update to phone user
      //   }
      //   user.name = name;
        // db update to name user
        socketInit(socket, session, user);

        socket.on('chatSend', async function(data){
          io.in(session.id).emit('chatReceive', data)

          await Chats.create({
            message: data.message,
            sessionId: session.id,
            userId: user.id,
          });
        })
      // });
    }
    socket.emit('exception', { errorMessage: 'There is no such session' });
  });

  return httpServer;
};
