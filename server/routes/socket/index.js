const { redisHost, redisPort } = require('config');

const cookie = require('cookie');
const http = require('http');
const pathToRegexp = require('path-to-regexp');
const SocketIo = require('socket.io');
const SocketRedis = require('socket.io-redis');

const dbClient = require('db')();
const Chats = require('db/chats/model')(dbClient);
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const redisClient = require('services/redis')();

const initSocketEditor = require('./editor');
const initSocketChat = require('./chat');

const sessionRegex = pathToRegexp('/app/session/:school/:session');

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

const getCookieIds = (socket) => {
  const reqCookie = socket.request.headers.cookie;
  const cookies = cookie.parse(reqCookie);

  return {
    cookieId: cookies.cookieId,
  };
};

const getChats = async (session) => {
  const chats = await Chats.findAll({
    limit: 11,
    offset: 0,
    order: [[Chats.CREATED_AT, 'DESC']],
    where: { sessionId: session.get(Sessions.ID) },
  });

  return chats.map(chat => {
    const { color, createdAt, name, message, type, userId } = chat.get();
    return { color, date: createdAt, name, msg: message, type, userId };
  }).reverse();
};

const setupSocketDuplicate = (socket, userSessionName) => {
  socket.to(userSessionName).emit('socket:onDuplicate', socket.id);

  socket.on('socket:onDuplicate', (newSocketId) => {
    if (newSocketId !== socket.id) {
      socket.emit('socket:onDuplicate');
      socket.disconnect(true);
    }
  });
};

const socketInit = async (io, socket, session, user) => {
  socket.join(`session-${session.get(Sessions.ID)}`);
  socket.join(`user-${user.get(Users.ID)}`);

  await initSocketChat(io, socket, session, user);
  initSocketEditor(io, socket, session, user);

  const msgs = await getChats(session);

  socket.emit('socket:onEnter', {
    content: session.get(Sessions.CONTENT),
    hasMore: (msgs.length > 10),
    msgs: (msgs.length > 10) ? msgs.slice(1) : msgs,
  });

  setupSocketDuplicate(socket, `user-${user.get(Users.ID)}`);
};

// main
module.exports = (app) => {
  const httpServer = http.Server(app);
  const io = SocketIo(httpServer);
  io.adapter(SocketRedis({ host: redisHost, port: redisPort }));

  io.on('connection', (socket) => {
    const names = getSchoolAndSession(socket);
    const { cookieId } = getCookieIds(socket);

    socket.on('socket:init', async () => {
      if (!cookieId || !names.schoolName || !names.sessionName) {
        return socket.emit('socket:onException', { errorMessage: 'Invalid authentication.' });
      }

      socket.on('socket:onEnter', async () => {
        const userId = await redisClient.hgetAsync(cookieId, redisClient.USER_ID);
        const sessionId = await redisClient.hgetAsync(cookieId, redisClient.SESSION_ID);
        const schoolName = await redisClient.hgetAsync(cookieId, redisClient.SESSION_SCHOOL);
        const sessionName = await redisClient.hgetAsync(cookieId, redisClient.SESSION_NAME);

        const sessionPromise = Sessions.findOne({ where: { id: sessionId }});
        const userPromise = Users.findOne({ where: { id: userId }});
        const [session, user] = await Promise.all([sessionPromise, userPromise]);

        if (!session || !user) {
          return socket.emit('socket:onException', { errorMessage: 'Invalid session' });
        }

        if (schoolName !== names.schoolName || sessionName !== names.sessionName) {
          return socket.emit('socket:onException', { errorMessage: 'You are not authenticated with the right session.' });
        }
        return socketInit(io, socket, session, user);
      });
      return null;
    });
  });

  return httpServer;
};
