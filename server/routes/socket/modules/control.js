const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);
// const Users = require('db/users/model')(dbClient);

const {
  CONTROL_INIT,
  CONTROL_UPDATE_STATUS,
  SOCKET_EXCEPTION,
} = require('routes/socket/defs');

module.exports = (wss, ws, session, /* user */) => {
  const sessionId = session.get(Sessions.ID);
  const sessionName = `session-${sessionId}`;

  // const userId = user.get(Users.ID);
  // const color = user.get(Users.COLOR);
  // const name = user.get(Users.NAME);

  ws.onEvent(CONTROL_INIT, async ({ participants }) => {
    if (!participants || participants === 0) {
      ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'Invalid number of participants.' });
      return;
    }

    await session.update({
      participants,
      status: Sessions.STATUS_WAITING,
    });

    wss.to(sessionName).sendEvent(CONTROL_UPDATE_STATUS, {
      participants,
      status: Sessions.STATUS_WAITING,
    });
  });
};
