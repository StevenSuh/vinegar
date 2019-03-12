const cookie = require('cookie');
const pathToRegexp = require('path-to-regexp');

const logger = require('services/logger');

const Chats = require('db/chats/model');
const Sessions = require('db/sessions/model');

const { tryCatch } = require('utils');

const { SOCKET_CLOSE, SOCKET_DUPLICATE } = require('./defs');

const sessionRegex = pathToRegexp('/ws/app/session/:school/:session');

const socketLogger = (message, ws, time) => {
  const now = new Date().toTimeString().split(' ')[0];
  if (message === 'pong') {
    return logger.log(`SOCKET /pong ${ws.sessions.join(', ')} - ${time}ms - ${now}`);
  }

  let data = message;
  if (typeof data === 'object') {
    data = tryCatch(() => JSON.parse(message));
  }

  if (data) {
    logger.log(`SOCKET /${data.type} ${ws.sessions.join(', ')} - ${time}ms - ${now}`);
  } else {
    logger.log(`SOCKET error - ${message} - ${time}ms - ${now}`);
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
