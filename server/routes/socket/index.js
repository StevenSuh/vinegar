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

  socket.emit('socket:onEnter', {
    content: session.get(Sessions.CONTENT),
  });
};

// main
module.exports = (app) => {
  const httpServer = http.Server(app);
  const io = SocketIo(httpServer);
  io.adapter(SocketRedis({ host: redisHost, port: redisPort }));

  io.on('connection', async (socket) => {
    const names = getSchoolAndSession(socket);
    const cookieId = getCookieId(socket);

    if (!cookieId || !names.schoolName || !names.sessionName) {
      return socket.emit('exception', { errorMessage: 'Invalid authentication.' });
    }

    socket.on('socket:onEnter', async ({ color, name }) => {
      const sessionId = await redisClient.hgetAsync(cookieId, redisClient.SESSION_ID);
      const userId = await redisClient.hgetAsync(cookieId, redisClient.USER_ID);

      const schoolName = await redisClient.hgetAsync(cookieId, redisClient.SESSION_SCHOOL);
      const sessionName = await redisClient.hgetAsync(cookieId, redisClient.SESSION_NAME);

      const sessionPromise = Sessions.findOne({ where: { id: sessionId }});
      const userPromise = Users.findOne({ where: { id: userId }});
      const [session, user] = await Promise.all([sessionPromise, userPromise]);

      if (!session || !user) {
        return socket.emit('exception', { errorMessage: 'Invalid session' });
      }

      if (schoolName !== names.schoolName || sessionName !== names.sessionName) {
        return socket.emit('exception', { errorMessage: 'You are not authenticated with the right session.' });
      }

      user.color = color;
      user.name = name;
      return socketInit(io, socket, session, user);
    });
    return null;
  });

  return httpServer;
};
