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
  getRoundRobinEvents,
  SUBSCRIBE_EVENTS,
} = require('defs');
const { exitHandler } = require('utils');

const intervalManagers = {};

addCallback(INTERVAL_CREATE, async ({ sessionId }) => {
  const session = await Sessions.findOne({ where: { id: sessionId } });

  const intervalManager = new IntervalManager(
    { session, publisher },
    intervalManagers,
  );
  await intervalManager.setupInterval();

  const { managerId } = intervalManager;
  intervalManagers[managerId] = intervalManager;
});

addCallback(INTERVAL_REASSIGN, async ({ managerId, userId }) => {
  const intervalManager = intervalManagers[managerId];

  if (intervalManager) {
    await intervalManager.reassignInterval(userId);
  } else {
    throw new Error(`Interval Manager: ${managerId} does not exist in this robin: ${getRoundRobinId()}`);
  }
});

subscriber.subscribe(
  ...getRoundRobinEvents(getRoundRobinId()),
  ...Object.values(SUBSCRIBE_EVENTS),
);

exitHandler(intervalManagers);
