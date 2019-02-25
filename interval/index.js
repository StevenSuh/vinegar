const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);

const {
  addCallback,
  publisher,
  subscriber,
} = require('services/redis');
const IntervalManager = require('services/interval');

const {
  INTERVAL_CREATE,
  INTERVAL_REASSIGN,
  SUBSCRIBE_EVENTS,
} = require('defs');

const intervalManagers = {};

addCallback(INTERVAL_CREATE, async ({ sessionId }) => {
  const session = await Sessions.findOne({ where: { id: sessionId } });

  const intervalManager = new IntervalManager(
    { session, publisher },
    intervalManagers,
  );
  await intervalManager.setupInterval();
  await intervalManager.startInterval(null, true);

  const { managerId } = intervalManager;
  intervalManagers[managerId] = intervalManager;
});

addCallback(INTERVAL_REASSIGN, async ({ managerId, userId }) => {
  console.log(INTERVAL_REASSIGN, managerId, userId);
  const intervalManager = intervalManagers[managerId];

  if (intervalManager) {
    await intervalManager.reassignInterval(userId);
  }
});

subscriber.subscribe(...Object.values(SUBSCRIBE_EVENTS));
