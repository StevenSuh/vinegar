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
const { exitHandler } = require('utils');

const sessions = {};

addCallback(INTERVAL_SETUP, async ({ robinId, sessionId }) => {
  if (robinId === undefined || robinId === null) {
    throw new Error('RobinId must be defined', robinId);
  }
  const clientRobinId = await getRoundRobinId();
  if (robinId !== clientRobinId) {
    return;
  }

  const session = await Sessions.findOne({ where: { id: sessionId } });
  const intervalManager = new IntervalManager({ session, publisher }, sessions);
  await intervalManager.startIdleCheck();

  sessions[sessionId] = intervalManager;
});

addCallback(INTERVAL_CREATE, async ({ robinId, sessionId }) => {
  if (robinId === undefined || robinId === null) {
    throw new Error('RobinId must be defined', robinId);
  }
  const clientRobinId = await getRoundRobinId();
  if (robinId !== clientRobinId) {
    return;
  }

  const intervalManager = sessions[sessionId];
  if (intervalManager) {
    await intervalManager.setupInterval();
  } else {
    throw new Error(
      `Interval Manager: ${sessionId} does not exist in this robin: ${await getRoundRobinId()}`,
    );
  }
});

addCallback(INTERVAL_REASSIGN, async ({ sessionId, robinId, userId }) => {
  if (robinId === undefined || robinId === null) {
    throw new Error('RobinId must be defined', robinId);
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
