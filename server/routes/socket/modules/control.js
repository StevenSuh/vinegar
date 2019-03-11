const {
  createInterval,
  reassignInterval,
} = require('services/interval');
const { createPdf } = require('services/worker');

const Intervals = require('db/intervals/model');
const Sessions = require('db/sessions/model');
const Users = require('db/users/model');

const {
  CONTROL_DOWNLOAD,
  CONTROL_ENTER,
  CONTROL_INIT,
  CONTROL_INTERVAL,
  CONTROL_UPDATE_STATUS,
  CONTROL_WAIT,
  SOCKET_EXCEPTION,
} = require('routes/socket/defs');

const { getPeople } = require('routes/socket/utils');

module.exports = async (wss, ws, session, user) => {
  const sessionId = session.get(Sessions.ID);
  const sessionName = `session-${sessionId}`;

  const userId = user.get(Users.ID);
  const isOwner = session.get(Sessions.OWNER_ID) === userId;

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
    intervalUser: interval ? interval.get(Intervals.USERNAME) : '',
    isOwner,
    participants: session.get(Sessions.PARTICIPANTS),
    status: session.get(Sessions.STATUS),
  });

  ws.onEvent(CONTROL_INIT, async ({ participants }) => {
    if (!isOwner) {
      return;
    }

    const status = session.get(Sessions.STATUS);
    if (status !== Sessions.STATUS_CREATED) {
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

    await session.update(update);
    if (isFull) {
      await createInterval(sessionId);
    } else {
      wss.to(sessionName).sendEvent(CONTROL_UPDATE_STATUS, update);
    }
  });

  ws.onServer(CONTROL_WAIT, async () => {
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

    await createInterval(sessionId);
  });

  ws.onEvent(CONTROL_DOWNLOAD, async () => {
    createPdf(sessionId, userId);
  });

  ws.on('close', async () => {
    if (session.get(Sessions.STATUS) === Sessions.STATUS_ACTIVE) {
      reassignInterval(sessionId, userId);
    }
  });
};
