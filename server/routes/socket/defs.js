module.exports = {
  SOCKET_CLOSE: 'socket:onClose',
  SOCKET_DUPLICATE: 'socket:onDuplicate',
  SOCKET_ENTER: 'socket:onEnter',
  SOCKET_EXCEPTION: 'socket:onException',
  SOCKET_INIT: 'socket:onInit',

  CHAT_ENTER: 'chat:onEnter',
  CHAT_SEND: 'chat:onChatSend',
  CHAT_SCROLL: 'chat:onChatScroll',

  CONTROL_ENTER: 'control:onEnter',
  CONTROL_DOWNLOAD: 'control:onDownload',
  CONTROL_DOWNLOAD_ERROR: 'control:onDownloadError',
  CONTROL_INIT: 'control:onInit',
  CONTROL_INTERVAL: 'control:onInterval',
  CONTROL_UPDATE_STATUS: 'control:onUpdateStatus',
  CONTROL_WAIT: 'control:onWait',

  EDITOR_ENTER: 'editor:onEnter',
  EDITOR_TEXT_UPDATE: 'editor:onEditorTextUpdate',
  EDITOR_CONTENT_REQUEST: 'editor:onEditorContentRequest',
  EDITOR_CONTENT_UPDATE: 'editor:onEditorContentUpdate',
  EDITOR_SELECTION_UPDATE: 'editor:onEditorSelectionUpdate',
  EDITOR_SELECTION_REMOVE: 'editor:onEditorSelectionRemove',

  IDLE_REMIND: 'idle:onRemind',

  INTERVAL_CREATE: 'interval:onCreate',
  INTERVAL_REASSIGN: 'interval:onReassign',
  INTERVAL_SETUP: 'interval:onSetup',
  INTERVAL_STATUS: 'interval:onStatus',
  INTERVAL_UPDATE: 'interval:onUpdate',

  PDF_CREATE: 'pdf:onCreate',

  PEOPLE_DELETE: 'people:onDelete',
  PEOPLE_ENTER: 'people:onEnter',
  PEOPLE_JOIN: 'people:onJoin',
  PEOPLE_LEAVE: 'people:onLeave',

  REDIS_EVENT: 'redis:websocket',

  SUBSCRIBE_EVENTS: {
    SOCKET_CLOSE: 'socket:onClose',
    SOCKET_DUPLICATE: 'socket:onDuplicate',

    CHAT_SEND: 'chat:onChatSend',

    CONTROL_DOWNLOAD: 'control:onDownload',
    CONTROL_DOWNLOAD_ERROR: 'control:onDownloadError',
    CONTROL_INTERVAL: 'control:onInterval',
    CONTROL_UPDATE_STATUS: 'control:onUpdateStatus',
    CONTROL_WAIT: 'control:onWait',

    EDITOR_TEXT_UPDATE: 'editor:onEditorTextUpdate',
    EDITOR_CONTENT_REQUEST: 'editor:onEditorContentRequest',
    EDITOR_CONTENT_UPDATE: 'editor:onEditorContentUpdate',
    EDITOR_SELECTION_UPDATE: 'editor:onEditorSelectionUpdate',
    EDITOR_SELECTION_REMOVE: 'editor:onEditorSelectionRemove',

    IDLE_REMIND: 'interval:onRemind',

    INTERVAL_STATUS: 'interval:onStatus',
    INTERVAL_UPDATE: 'interval:onUpdate',

    PEOPLE_JOIN: 'people:onJoin',
    PEOPLE_LEAVE: 'people:onLeave',

    REDIS_EVENT: 'redis:websocket',
  },
};
