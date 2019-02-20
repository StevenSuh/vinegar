// const { redisHost, redisPort } = require('config');

const WebSocket = require('ws');
const { WsWrapper, WssWrapper } = require('routes/socket/wrapper');

const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const redisClient = require('services/redis')();

const { inflate } = require('utils');

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

  setupSocketDuplicate(ws, `user-${user.get(Users.ID)}`);
  await initSocketChat(wss, ws, session, user);
  initSocketEditor(wss, ws, session, user);

  const msgs = await getChats(session);
  ws.sendEvent(SOCKET_ENTER, {
    content: inflate(session.get(Sessions.CONTENT)),
    isOwner: session.get(Sessions.OWNER_ID) === user.get(Users.ID),
    hasMore: (msgs.length > 10),
    msgs: (msgs.length > 10) ? msgs.slice(1) : msgs,
  });
};

// main
module.exports = (server) => {
  const wss = WssWrapper(new WebSocket.Server({
    path: true,
    server,
    perMessageDeflate: {
      zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      // Other options settable:
      clientNoContextTakeover: true, // Defaults to negotiated value.
      serverNoContextTakeover: true, // Defaults to negotiated value.
      serverMaxWindowBits: 10, // Defaults to negotiated value.
      // Below options specified as default values.
      concurrencyLimit: 10, // Limits zlib concurrency for perf.
      threshold: 1024 // Size (in bytes) below which messages
      // should not be compressed.
    },
  }));

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
          ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'Session does not exist.' });
          return ws.close();
        }

        if (schoolName !== names.schoolName || sessionName !== names.sessionName) {
          ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'Session does not exist.' });
          return ws.close();
        }
        return startSocket(wss, ws, session, user);
      });
    });
  });
};
