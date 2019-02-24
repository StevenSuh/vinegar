const startInterval = require('services/interval');

const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const {
  CONTROL_ENTER,
  CONTROL_INIT,
  CONTROL_INTERVAL,
  CONTROL_UPDATE_STATUS,
  CONTROL_WAIT,
  SOCKET_EXCEPTION,
} = require('routes/socket/defs');

const { getPeople } = require('routes/socket/utils');

module.exports = (wss, ws, session, user) => {
  const sessionId = session.get(Sessions.ID);
  const sessionName = `session-${sessionId}`;

  const userId = user.get(Users.ID);

  ws.sendEvent(CONTROL_ENTER, {
    duration: session.get(Sessions.DURATION),
    endTime: session.get(Sessions.END_TIME),
    isOwner: session.get(Sessions.OWNER_ID) === userId,
    participants: session.get(Sessions.PARTICIPANTS),
    status: session.get(Sessions.STATUS),
  });

  ws.onEvent(CONTROL_INIT, async ({ participants }) => {
    if (!participants || participants === 0) {
      ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'Invalid number of participants.' });
      return;
    }

    const people = await getPeople(session);
    const isFull = participants <= people.length;
    const update = { participants, status: Sessions.STATUS_WAITING };

    if (isFull) {
      update.status = Sessions.STATUS_ACTIVE;
      update.endTime = Date.now() + session.get(Sessions.DURATION);
    }

    await session.update(update);

    if (isFull) {
      intervalClient.startInterval(sessionId);
    }

    wss.to(sessionName).sendEvent(CONTROL_UPDATE_STATUS, update);
  });

  ws.onEvent(CONTROL_WAIT, async () => {
    const participants = session.get(Sessions.PARTICIPANTS);
    const people = await getPeople(session);

    if (participants > people.length) {
      ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'Invalid number of participants.' });
      return;
    }

    const update = {
      endTime: Date.now() + session.get(Sessions.DURATION),
      status: Sessions.STATUS_ACTIVE,
    };

    await session.update(update);
    intervalClient.startInterval(sessionId);
    wss.to(sessionName).sendEvent(CONTROL_UPDATE_STATUS, update);
  });

  ws.onServer(CONTROL_INTERVAL, () => {
    ws.sendEvent(CONTROL_INTERVAL);
  });

  ws.on('close', () => {
    const intervalManagerId = session.get(Sessions.INTERVAL_MANAGER_ID);
    if (intervalManagerId) {
      intervalClient.reassignInterval(intervalManagerId, userId);
    }
  });
};
