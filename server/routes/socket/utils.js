const cookie = require('cookie');
const pathToRegexp = require('path-to-regexp');

const dbClient = require('db')();
const Chats = require('db/chats/model')(dbClient);
const Sessions = require('db/sessions/model')(dbClient);

const { tryCatch } = require('utils');

const { EDITOR_CONTENT_UPDATE, SOCKET_CLOSE, SOCKET_DUPLICATE } = require('./defs');

const sessionRegex = pathToRegexp('/ws/app/session/:school/:session');

const socketLogger = (message, ws) => {
  if (process.env.NODE_ENV !== 'production') {
    if (message === 'pong') {
      // eslint-disable-next-line no-console
      console.log(`SOCKET /pong ${ws.sessions.join(', ')} - ${message}`);
      return;
    }

    const data = tryCatch(() => JSON.parse(message));

    if (data) {
      const { type } = data;
      const msg = { ...data };
      if (type === EDITOR_CONTENT_UPDATE) {
        delete msg.content;
      }
      // eslint-disable-next-line no-console
      console.log(`SOCKET /${type} ${ws.sessions.join(', ')} - ${JSON.stringify(msg)}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`SOCKET error - ${message}`);
    }
  }
};

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
  const chats = await session.getChats({
    limit: 11,
    offset: 0,
    order: [[Chats.CREATED_AT, 'DESC']],
  });

  return chats.map(chat => {
    const { color, createdAt, name, message, type, userId } = chat.get();
    return { color, date: createdAt, name, msg: message, type, userId };
  }).reverse();
};

const getPeople = async (session) => {
  const people = await session.getUsers({ where: { active: true }});

  return people.map(person => {
    const { id, name } = person.get();
    const isOwner = id === session.get(Sessions.OWNER_ID);

    return { id, name, isOwner };
  });
};

const setupSocketClose = (ws) => {
  ws.onServer(SOCKET_CLOSE, () => {
    ws.close();
  });
};

const setupSocketDuplicate = (ws, userSessionName) => {
  ws.to(userSessionName).sendServer(SOCKET_DUPLICATE, { id: ws.id });

  ws.onServer(SOCKET_DUPLICATE, ({ id: newWsId }) => {
    if (newWsId !== ws.id) {
      ws.sendEvent(SOCKET_DUPLICATE);
      ws.close();
    }
  });
};

module.exports = {
  getCookieIds,
  getChats,
  getPeople,
  getSchoolAndSession,
  shouldHandle,
  setupSocketClose,
  setupSocketDuplicate,
  socketLogger,
};
