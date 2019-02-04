const { redisHost, redisPort } = require('config');

const cookie = require('cookie');
const http = require('http');
const pathToRegexp = require('path-to-regexp');
const SocketIo = require('socket.io');
const SocketRedis = require('socket.io-redis');

const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const redisClient = require('services/redis')();

const initSocketEditor = require('./editor');
const initSocketChat = require('./chat');

const sessionRegex = pathToRegexp('/session/:school/:session');

// helpers
const getSchoolAndSession = (socket) => {
  const { referer } = socket.request.headers;
  const decodedUrl = decodeURI(referer);
  const urlEnding = decodedUrl.slice(decodedUrl.split('/', 3).join('/').length);

  const sessionParse = sessionRegex.exec(urlEnding) || [];
  return {
    schoolName: sessionParse[1],
    sessionName: sessionParse[2],
  };
};

const getCookieId = (socket) => {
  const reqCookie = socket.request.headers.cookie;
  const cookies = cookie.parse(reqCookie);

  return cookies.cookieId;
};

const socketInit = (io, socket, session, user) => {
  socket.join(session.id);
  initSocketChat(io, socket, session, user);
  initSocketEditor(io, socket, session, user);

  io.in(session.id).emit('socket:onEnter', {
    color: user.color,
    name: user.name,
  });
};

// main
module.exports = (app) => {
  const httpServer = http.Server(app);
  const io = SocketIo(httpServer);
  io.adapter(SocketRedis({ host: redisHost, port: redisPort }));

  io.on('connection', async (socket) => {
    const { schoolName, sessionName } = getSchoolAndSession(socket);
    const cookieId = getCookieId(socket);
    const userId = await redisClient.hgetAsync(cookieId, 'user');

    const sessionPromise = Sessions.findActiveBySchoolAndSession({
      attributes: [Sessions.ID, Sessions.PASSWORD, Sessions.SCHOOL_NAME, Sessions.SESSION_NAME],
      schoolName,
      sessionName,
    });
    const userPromise = Users.findOne({
      attributes: [Users.ID],
      where: { id: userId },
    });

    const [session, user] = await Promise.all([sessionPromise, userPromise]);

    if (!session || !user) {
      socket.emit('exception', {
        errorMessage: 'Invalid session',
      });
      return;
    }

    if (session.schoolName === schoolName && session.sessionName === sessionName) {
      socket.on('socket:onEnter', ({ color, name }) => {
        user.color = color;
        user.name = name;
        socketInit(io, socket, session, user);
      });
    }
    socket.emit('exception', { errorMessage: 'There is no such session' });
  });

  return httpServer;
};
