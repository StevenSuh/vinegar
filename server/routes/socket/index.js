// const { redisHost, redisPort } = require('config');

const WebSocket = require('ws');
const { WsWrapper, WssWrapper } = require('routes/socket/wrapper');

const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const redisClient = require('services/redis')();

const initSocketEditor = require('./modules/editor');
const initSocketChat = require('./modules/chat');
const initSocketControl = require('./modules/control');
const initSocketPeople = require('./modules/people');

const {
  getCookieIds,
  getSchoolAndSession,
  shouldHandle,
  setupSocketDuplicate,
} = require('./utils');

const {
  SOCKET_ENTER,
  SOCKET_EXCEPTION,
  SOCKET_INIT,
} = require('./defs');

WebSocket.Server.prototype.shouldHandle = shouldHandle;

const startSocket = async (wss, ws, session, user) => {
  const startTime = Date.now();
  await user.update({ active: true });

  ws.join(`session-${session.get(Sessions.ID)}`);
  ws.join(`user-${user.get(Users.ID)}`);

  setupSocketDuplicate(ws, `user-${user.get(Users.ID)}`);

  await initSocketChat(wss, ws, session, user);
  initSocketEditor(wss, ws, session, user);
  initSocketControl(wss, ws, session, user);
  await initSocketPeople(wss, ws, session, user);

  const diffTime = Date.now() - startTime;
  console.log('SOCKET /socket:onEnter took:', `${diffTime}ms`);
};

// main
module.exports = (server) => {
  const wss = WssWrapper(new WebSocket.Server({ path: true, server }));

  wss.on('connection', (socket, req) => {
    const ws = WsWrapper(socket);

    const names = getSchoolAndSession(req);
    const { cookieId } = getCookieIds(req);

    ws.onEvent(SOCKET_INIT, () => {
      if (!cookieId || !names.schoolName || !names.sessionName) {
        ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'Invalid authentication.' });
        return ws.close();
      }

      ws.onEvent(SOCKET_ENTER, async () => {
        const userIdExists = await redisClient.hexistsAsync(redisClient.userId({ cookieId }));
        const sessionIdExists = await redisClient.hexistsAsync(redisClient.sessionId({ cookieId }));

        if (!userIdExists || !sessionIdExists) {
          ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'Invalid authentication.' });
          return ws.close();
        }

        const userId = await redisClient.hgetAsync(redisClient.userId({ cookieId }));
        const sessionId = await redisClient.hgetAsync(redisClient.sessionId({ cookieId }));
        const schoolName = await redisClient.hgetAsync(redisClient.sessionSchool({ cookieId, sessionId }));
        const sessionName = await redisClient.hgetAsync(redisClient.sessionName({ cookieId, sessionId }));

        const sessionPromise = Sessions.findOne({ where: { id: sessionId }});
        const userPromise = Users.findOne({ where: { id: userId }});
        const [session, user] = await Promise.all([sessionPromise, userPromise]);

        if (!session || !user) {
          ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'Session does not exist.' });
          return ws.close();
        }

        if (schoolName !== names.schoolName || sessionName !== names.sessionName) {
          ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'Session does not exist.' });
          return ws.close();
        }

        if (!user.get(Users.COLOR) || !user.get(Users.NAME)) {
          ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'You have not provided your name. Please try refreshing.' });
          return ws.close();
        }
        return startSocket(wss, ws, session, user);
      });
    });
  });
};
