module.exports = {
  BUCKET_NAME: 'pdf-vinegar',

  CONTROL_DOWNLOAD: 'control:onDownload',

  PDF_CREATE: 'pdf:onCreate',

  REDIS_SOCKET: 'redis:websocket',

  WORKER_TOTAL: 'worker:total',
  WORKER_ROTATE: 'worker:rotate',

  SUBSCRIBE_EVENTS: {
    PDF_CREATE: 'pdf:onCreate',
  },
};
