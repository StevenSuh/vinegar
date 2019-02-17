// const { redisHost, redisPort } = require('config');

const WebSocket = require('ws');
const { WsWrapper, WssWrapper } = require('routes/socket/wrapper');

const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const redisClient = require('services/redis')();

const initSocketEditor = require('./modules/editor');
const initSocketChat = require('./modules/chat');

const {
  getSchoolAndSession,
  getCookieIds,
  getChats,
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
  ws.join(`session-${session.get(Sessions.ID)}`);
  ws.join(`user-${user.get(Users.ID)}`);

  await initSocketChat(wss, ws, session, user);
  initSocketEditor(wss, ws, session, user);

  const msgs = await getChats(session);

  ws.sendEvent(SOCKET_ENTER, {
    content: session.get(Sessions.CONTENT),
    isOwner: session.get(Sessions.OWNER_ID) === user.get(Users.ID),
    hasMore: (msgs.length > 10),
    msgs: (msgs.length > 10) ? msgs.slice(1) : msgs,
  });

  setupSocketDuplicate(ws, `user-${user.get(Users.ID)}`);
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
        const userId = await redisClient.hgetAsync(cookieId, redisClient.USER_ID);
        const sessionId = await redisClient.hgetAsync(cookieId, redisClient.SESSION_ID);
        const schoolName = await redisClient.hgetAsync(cookieId, redisClient.SESSION_SCHOOL);
        const sessionName = await redisClient.hgetAsync(cookieId, redisClient.SESSION_NAME);

        const sessionPromise = Sessions.findOne({ where: { id: sessionId }});
        const userPromise = Users.findOne({ where: { id: userId }});
        const [session, user] = await Promise.all([sessionPromise, userPromise]);

        if (!session || !user) {
          ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'Invalid Session.' });
          return ws.close();
        }

        if (schoolName !== names.schoolName || sessionName !== names.sessionName) {
          ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'You are not authenticated with the right session.' });
          return ws.close();
        }
        return startSocket(wss, ws, session, user);
      });
    });
  });
};
