const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);

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
  SUBSCRIBE_EVENTS,
} = require('defs');
const { exitHandler } = require('utils');

const sessions = {};

addCallback(INTERVAL_CREATE, async ({ robinId, sessionId }) => {
  if (!robinId) {
    throw new Error('RobinId must be defined');
  }
  const clientRobinId = await getRoundRobinId();
  if (robinId !== clientRobinId) {
    return;
  }

  const session = await Sessions.findOne({ where: { id: sessionId } });
  const intervalManager = new IntervalManager({ session, publisher }, sessions);
  await intervalManager.setupInterval();

  sessions[sessionId] = intervalManager;
});

addCallback(INTERVAL_REASSIGN, async ({ sessionId, robinId, userId }) => {
  if (!robinId) {
    throw new Error('RobinId must be defined');
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
