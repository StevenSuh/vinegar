const { redisHost, redisPort } = require('config');

const http = require('http');
const SocketIo = require('socket.io');
const SocketRedis = require('socket.io-redis');

const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const redisClient = require('services/redis')();

const initSocketEditor = require('./editor');
const initSocketChat = require('./chat');

const {
  getSchoolAndSession,
  getCookieIds,
  getChats,
  setupSocketDuplicate,
} = require('./utils');

const startSocket = async (io, socket, session, user) => {
  socket.join(`session-${session.get(Sessions.ID)}`);
  socket.join(`user-${user.get(Users.ID)}`);

  await initSocketChat(io, socket, session, user);
  initSocketEditor(io, socket, session, user);

  const msgs = await getChats(session);

  socket.emit('socket:onEnter', {
    content: session.get(Sessions.CONTENT),
    isOwner: session.get(Sessions.OWNER_ID) === user.get(Users.ID),
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
        return startSocket(io, socket, session, user);
      });
      return null;
    });
  });

  return httpServer;
};
