module.exports = {
  SESSION_END_DURATION: 1000 * 60 * 5,
  REASSIGN_WAIT_DURATION: 1000 * 60,

  DEFAULT_COLOR: '#F88379',
  DEFAULT_REMIND_MSG: ' will be closing soon.',

  CHAT_SEND: 'chat:onChatSend',

  CONTROL_INTERVAL: 'control:onInterval',
  CONTROL_UPDATE_STATUS: 'control:onUpdateStatus',

  INTERVAL_CREATE: 'interval:onCreate',
  INTERVAL_REASSIGN: 'interval:onReassign',
  INTERVAL_SETUP: 'interval:onSetup',
  INTERVAL_STATUS: 'interval:onStatus',
  INTERVAL_UPDATE: 'interval:onUpdate',

  ROBIN_ROTATE: 'robin:rotate',
  ROBIN_TOTAL: 'robin:total',

  REDIS_SOCKET: 'redis:websocket',

  SOCKET_CLOSE: 'socket:onClose',

  SUBSCRIBE_EVENTS: {
    INTERVAL_CREATE: 'interval:onCreate',
    INTERVAL_REASSIGN: 'interval:onReassign',
    INTERVAL_SETUP: 'interval:onSetup',
  },
};
