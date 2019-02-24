const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const {
  PEOPLE_ENTER,
  PEOPLE_JOIN,
  PEOPLE_LEAVE,
} = require('routes/socket/defs');

const { getPeople } = require('routes/socket/utils');

module.exports = async (_wss, ws, session, user) => {
  const sessionId = session.get(Sessions.ID);
  const sessionName = `session-${sessionId}`;

  const userId = user.get(Users.ID);
  const name = user.get(Users.NAME);

  ws.sendEvent(PEOPLE_ENTER, {
    isOwner: session.get(Sessions.OWNER_ID) === userId,
    participants: session.get(Sessions.PARTICIPANTS),
    people: await getPeople(session),
    status: session.get(Sessions.STATUS),
  });

  ws.to(sessionName).sendEvent(PEOPLE_JOIN, {
    userId,
    name,
    isOwner: userId === session.get(Sessions.OWNER_ID),
  });

  ws.on('close', () => {
    user.update({ active: false });
    ws.to(sessionName).sendEvent(PEOPLE_LEAVE, { userId });
  });
};
