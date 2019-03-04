module.exports = {
  BUCKET_NAME: 'pdf-vinegar',

  CONTROL_DOWNLOAD: 'control:onDownload',

  PDF_CREATE: 'pdf:onCreate',

  WORKER_TOTAL: 'worker:onTotal',
  WORKER_ROTATE: 'worker:onRotate',

  SUBSCRIBE_EVENTS: {
    PDF_CREATE: 'pdf:onCreate',
  },
};
