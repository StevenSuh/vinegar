module.exports = {
  CONTROL_IS_INTERVAL: 'control:onIsInterval',
  CONTROL_UPDATE_STATUS: 'control:onUpdateStatus',

  INTERVAL_CREATE: 'interval:onCreate',
  INTERVAL_REASSIGN: 'interval:onReassign',
  INTERVAL_REMIND: 'interval:onRemind',
  INTERVAL_STATUS: 'interval:onStatus',
  INTERVAL_UPDATE: 'interval:onUpdate',

  ROBIN_ROTATE: 'robin:rotate',
  ROBIN_TOTAL: 'robin:total',

  REDIS_SOCKET: 'redis:websocket',

  SOCKET_CLOSE: 'socket:onClose',

  SUBSCRIBE_EVENTS: {
    INTERVAL_CREATE: 'interval:onCreate',
    INTERVAL_REASSIGN: 'interval:onReassign',
  },
};
