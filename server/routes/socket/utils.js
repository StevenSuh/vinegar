const cookie = require('cookie');
const pathToRegexp = require('path-to-regexp');

const dbClient = require('db')();
const Chats = require('db/chats/model')(dbClient);
const Sessions = require('db/sessions/model')(dbClient);

const { SOCKET_DUPLICATE } = require('./defs');

const sessionRegex = pathToRegexp('/ws/app/session/:school/:session');

const shouldHandle = function(req) {
  const match = sessionRegex.exec(req.url);

  if (!match) {
    return false;
  }
  return true;
};

const getSchoolAndSession = (req) => {
  const referer = req.url;
  const decodedUrl = decodeURI(referer);
  const sessionParse = sessionRegex.exec(decodedUrl) || [];

  return {
    schoolName: sessionParse[1],
    sessionName: sessionParse[2],
  };
};

const getCookieIds = (req) => {
  const reqCookie = req.headers.cookie || '';
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

const setupSocketDuplicate = (ws, userSessionName) => {
  ws.to(userSessionName).sendServer(SOCKET_DUPLICATE, { id: ws.id });

  ws.onEventServer(SOCKET_DUPLICATE, ({ id: newWsId }) => {
    if (newWsId !== ws.id) {
      ws.sendEvent(SOCKET_DUPLICATE);
      ws.close();
    }
  });
};

module.exports = {
  getSchoolAndSession,
  getCookieIds,
  getChats,
  shouldHandle,
  setupSocketDuplicate,
};
