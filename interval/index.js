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

const intervalManagers = {};

addCallback(INTERVAL_CREATE, async ({ robinId, sessionId }) => {
  if (!robinId) {
    throw new Error('RobinId must be defined');
  }
  const clientRobinId = await getRoundRobinId();
  if (robinId !== clientRobinId) {
    return;
  }

  const session = await Sessions.findOne({ where: { id: sessionId } });
  const intervalManager = new IntervalManager(
    { session, publisher },
    intervalManagers,
  );
  await intervalManager.setupInterval();

  const { managerId } = intervalManager;
  intervalManagers[managerId] = intervalManager;
});

addCallback(INTERVAL_REASSIGN, async ({ managerId, robinId, userId }) => {
  if (!robinId) {
    throw new Error('RobinId must be defined');
  }
  const clientRobinId = await getRoundRobinId();
  if (robinId !== clientRobinId) {
    return;
  }

  const intervalManager = intervalManagers[managerId];
  if (intervalManager) {
    await intervalManager.reassignInterval(userId);
  } else {
    throw new Error(
      `Interval Manager: ${managerId} does not exist in this robin: ${await getRoundRobinId()}`,
    );
  }
});

subscriber.subscribe(...Object.values(SUBSCRIBE_EVENTS));

exitHandler(intervalManagers);
