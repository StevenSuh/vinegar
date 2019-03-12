const Sessions = require('db/sessions/model');
const Users = require('db/users/model');

const redisClient = require('services/redis');

const {
  CONTROL_WAIT,
  PEOPLE_DELETE,
  PEOPLE_ENTER,
  PEOPLE_JOIN,
  PEOPLE_LEAVE,
  SOCKET_CLOSE,
} = require('routes/socket/defs');

const { getPeople } = require('routes/socket/utils');

module.exports = async (_wss, ws, session, user) => {
  const sessionId = session.get(Sessions.ID);
  const sessionName = `session-${sessionId}`;

  const userId = user.get(Users.ID);
  const name = user.get(Users.NAME);
  const isOwner = userId === session.get(Sessions.OWNER_ID);
  const people = await getPeople(session);

  ws.sendEvent(PEOPLE_ENTER, {
    isOwner,
    participants: session.get(Sessions.PARTICIPANTS),
    people,
    status: session.get(Sessions.STATUS),
  });

  ws.to(sessionName).sendEvent(PEOPLE_JOIN, {
    id: userId,
    name,
    isOwner,
  });

  if (
    session.get(Sessions.STATUS) === Sessions.STATUS_WAITING &&
    session.get(Sessions.PARTICIPANTS) &&
    people.length >= parseInt(session.get(Sessions.PARTICIPANTS), 10)
  ) {
    const otherPeople = people.filter(({ id }) => id !== userId);
    const userIdName = `user-${otherPeople[0].id}`;
    ws.to(userIdName).sendServer(CONTROL_WAIT);
  }

  ws.onEvent(PEOPLE_DELETE, ({ id }) => {
    if (isOwner) {
      const targetUser = `user-${id}`;
      redisClient.incrAsync(redisClient.sessionBlock({ sessionId, userId: id }));
      ws.to(targetUser).sendEvent(PEOPLE_DELETE);
      ws.to(targetUser).sendServer(SOCKET_CLOSE);
    }
  });

  ws.on('close', () => {
    user.update({ active: false });
    ws.to(sessionName).sendEvent(PEOPLE_LEAVE, { userId });
  });
};
