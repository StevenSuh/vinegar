const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);
const IntervalManagers = require('db/intervalManagers/model')(dbClient);

const { addCallback, redisClient } = require('services/redis');
const IntervalManager = require('services/interval');

const {
  INTERVAL_CREATE,
  INTERVAL_REASSIGN,
  SUBSCRIBE_EVENTS,
} = require('defs');

const subscriber = redisClient.duplicateClient({ sub: true });
const publisher = redisClient.duplicateClient({ pub: true });

const intervalManagers = {};

addCallback(INTERVAL_CREATE, async ({ sessionId }) => {
  const session = await Sessions.findOne({ where: { id: sessionId } });

  const intervalManager = new IntervalManager(
    { session, publisher },
    intervalManagers,
  );
  await intervalManager.setupInterval();
  intervalManager.startInterval();

  const managerId = intervalManager.get(IntervalManagers.ID);
  intervalManagers[managerId] = intervalManager;
});

addCallback(INTERVAL_REASSIGN, async ({ managerId, userId }) => {
  const intervalManager = intervalManagers[managerId];

  if (intervalManager) {
    await intervalManager.reassignInterval(userId);
  }
});

subscriber.subscribe(...Object.values(SUBSCRIBE_EVENTS));
