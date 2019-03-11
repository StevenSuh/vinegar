module.exports = {
  ALLOWED_CHARACTERS: ['A-Z', 'a-z', '0-9', '-', '.', '_', '~', ' '],
  CONTENT_UPDATE_DUR: 1000,
  DEFAULT_COLOR: '#F88379',
  DEFAULT_ENTER_MSG: ' has entered the room.',
  DEFAULT_CREATE_MSG: ' has been created.',
  DEFAULT_IDLE_MSG: ' will close if the session does not start soon.',
  DEFAULT_LEAVE_MSG: ' has left the room.',
  DEFAULT_REMIND_MSG: ' will be closing soon.',
  MIN_PASSWORD_LENGTH: 4,
  MAX_BLOCK_COUNT: 3,

  ROBIN_ROTATE: 'robin:rotate',
  ROBIN_TOTAL: 'robin:total',
  WORKER_ROTATE: 'worker:rotate',
  WORKER_TOTAL: 'worker:total',
};
