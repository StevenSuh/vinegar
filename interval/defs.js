const SESSION_END_DURATION = 6000;
const REASSIGN_WAIT_DURATION = 30000;

const CONTROL_INTERVAL = 'control:onInterval';
const CONTROL_UPDATE_STATUS = 'control:onUpdateStatus';

const INTERVAL_CREATE = 'interval:onCreate';
const INTERVAL_REASSIGN = 'interval:onReassign';
const INTERVAL_REMIND = 'interval:onRemind';
const INTERVAL_STATUS = 'interval:onStatus';
const INTERVAL_UPDATE = 'interval:onUpdate';

const ROBIN_ROTATE = 'robin:rotate';
const ROBIN_TOTAL = 'robin:total';

const REDIS_SOCKET = 'redis:websocket';

const SOCKET_CLOSE = 'socket:onClose';

const ROUND_ROBIN_EVENTS = [INTERVAL_CREATE];
const SUBSCRIBE_EVENTS = [INTERVAL_REASSIGN];

module.exports = {
  SESSION_END_DURATION,
  REASSIGN_WAIT_DURATION,
  CONTROL_INTERVAL,
  CONTROL_UPDATE_STATUS,
  INTERVAL_CREATE,
  INTERVAL_REASSIGN,
  INTERVAL_REMIND,
  INTERVAL_STATUS,
  INTERVAL_UPDATE,
  ROBIN_ROTATE,
  ROBIN_TOTAL,
  REDIS_SOCKET,
  SOCKET_CLOSE,
  SUBSCRIBE_EVENTS,
  getRoundRobinEvents: robinId =>
    ROUND_ROBIN_EVENTS.map(event => `${event}-${robinId}`),
};
