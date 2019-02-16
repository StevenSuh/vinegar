const cookie = require('cookie');
const pathToRegexp = require('path-to-regexp');

const dbClient = require('db')();
const Chats = require('db/chats/model')(dbClient);
const Sessions = require('db/sessions/model')(dbClient);

const sessionRegex = pathToRegexp('/app/session/:school/:session');

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

module.exports = {
  getSchoolAndSession,
  getCookieIds,
  getChats,
  setupSocketDuplicate,
};
