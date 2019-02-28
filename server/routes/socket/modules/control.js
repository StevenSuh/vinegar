const { createInterval, reassignInterval } = require('services/interval');

const dbClient = require('db')();
const Intervals = require('db/intervals/model')(dbClient);
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

const { tryCatch } = require('utils');

module.exports = async (wss, ws, session, user) => {
  const sessionId = session.get(Sessions.ID);
  const sessionName = `session-${sessionId}`;

  const userId = user.get(Users.ID);

  if (session.get(Sessions.STATUS) === Sessions.STATUS_ACTIVE) {
    await createInterval(sessionId);
  }

  const currIntervalId = session.get(Sessions.CURRENT_INTERVAL_ID);
  const interval = !currIntervalId ? null :
    await Intervals.findOne({ where: { id: currIntervalId }});

  if (interval && interval.get(Intervals.USER_ID) === userId) {
    ws.sendEvent(CONTROL_INTERVAL, {
      isInterval: true,
      intervalEndTime: interval.get(Intervals.END_TIME),
    });
  }

  ws.sendEvent(CONTROL_ENTER, {
    duration: session.get(Sessions.DURATION),
    endTime: session.get(Sessions.END_TIME),
    intervalUser: interval && interval.get(Intervals.USERNAME),
    isOwner: session.get(Sessions.OWNER_ID) === userId,
    participants: session.get(Sessions.PARTICIPANTS),
    status: session.get(Sessions.STATUS),
  });

  ws.onEvent(CONTROL_INIT, async ({ participants }) => {
    const status = session.get(Sessions.STATUS);
    if (status !== Sessions.STATUS_INITIAL) {
      ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: `Session is currently ${status}.` });
      return ws.close();
    }

    if (!participants || participants === 0) {
      ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'Invalid number of participants.' });
      return ws.close();
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
      await createInterval(sessionId);
    } else {
      wss.to(sessionName).sendEvent(CONTROL_UPDATE_STATUS, update);
    }
  });

  ws.onEvent(CONTROL_WAIT, async () => {
    const status = session.get(Sessions.STATUS);
    if (status !== Sessions.STATUS_WAITING) {
      ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: `Session is currently ${status}.` });
      return;
    }

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
    await createInterval(sessionId);
  });

  ws.on('close', () => {
    tryCatch(async () => {
      await session.reload();
      const intervalManagerId = session.get(Sessions.INTERVAL_MANAGER_ID);
      if (intervalManagerId) {
        await reassignInterval(intervalManagerId, userId);
      }
    }, () => {});
  });
};
