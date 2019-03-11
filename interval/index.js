require('db');
const Sessions = require('db/sessions/model');

const {
  addCallback,
  getRoundRobinId,
  publisher,
  subscriber,
} = require('services/redis');
const IntervalManager = require('services/interval');

const {
  INTERVAL_CREATE,
  INTERVAL_REASSIGN,
  INTERVAL_SETUP,
  SUBSCRIBE_EVENTS,
} = require('defs');
const { exitHandler, cleanupJob } = require('utils');

const sessions = {};
getRoundRobinId();

addCallback(
  INTERVAL_SETUP,
  async ({ recreate, robinId, sessionId, userId }) => {
    const clientRobinId = await getRoundRobinId();
    console.log(clientRobinId);

    if (robinId === undefined || robinId === null) {
      throw new Error(
        `RobinId must be defined ${robinId}, sessionId ${sessionId}`,
      );
    }
    if (robinId !== clientRobinId) {
      return;
    }

    const session = await Sessions.findOne({ where: { id: sessionId } });
    const intervalManager = new IntervalManager(
      { session, publisher },
      sessions,
    );
    await intervalManager.startIdleCheck();

    if (recreate) {
      await intervalManager.setupInterval();
    }
    if (userId) {
      await intervalManager.reassignInterval(userId);
    }

    sessions[sessionId] = intervalManager;
  },
);

addCallback(INTERVAL_CREATE, async ({ robinId, sessionId }) => {
  if (robinId === undefined || robinId === null) {
    throw new Error(
      `RobinId must be defined ${robinId}, sessionId ${sessionId}`,
    );
  }
  const clientRobinId = await getRoundRobinId();
  if (robinId !== clientRobinId) {
    return;
  }

  const intervalManager = sessions[sessionId];
  if (intervalManager) {
    await intervalManager.session.update({
      endTime: Date.now() + intervalManager.session.get(Sessions.DURATION),
      status: Sessions.STATUS_ACTIVE,
    });
    await intervalManager.setupInterval();
  } else {
    throw new Error(
      `Interval Manager: ${sessionId} does not exist in this robin: ${await getRoundRobinId()}`,
    );
  }
});

addCallback(INTERVAL_REASSIGN, async ({ sessionId, robinId, userId }) => {
  if (robinId === undefined || robinId === null) {
    throw new Error(
      `RobinId must be defined ${robinId}, sessionId ${sessionId}`,
    );
  }
  const clientRobinId = await getRoundRobinId();
  if (robinId !== clientRobinId) {
    return;
  }

  const intervalManager = sessions[sessionId];
  if (intervalManager) {
    await intervalManager.reassignInterval(userId);
  } else {
    throw new Error(
      `Interval Manager: ${sessionId} does not exist in this robin: ${await getRoundRobinId()}`,
    );
  }
});

subscriber.subscribe(...Object.values(SUBSCRIBE_EVENTS));

exitHandler(sessions);
cleanupJob();
