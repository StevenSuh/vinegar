const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const {
  PEOPLE_ENTER,
  PEOPLE_LEAVE,
} = require('routes/socket/defs');

module.exports = (_wss, ws, session, user) => {
  const sessionId = session.get(Sessions.ID);
  const sessionName = `session-${sessionId}`;

  const userId = user.get(Users.ID);
  const name = user.get(Users.NAME);

  ws.to(sessionName).sendEvent(PEOPLE_ENTER, {
    userId,
    name,
    isOwner: userId === session.get(Sessions.OWNER_ID),
  });

  ws.on('close', () => {
    ws.to(sessionName).sendEvent(PEOPLE_LEAVE, { userId });
  });
};
