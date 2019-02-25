module.exports = {
  SOCKET_DUPLICATE: 'socket:onDuplicate',
  SOCKET_ENTER: 'socket:onEnter',
  SOCKET_EXCEPTION: 'socket:onException',
  SOCKET_INIT: 'socket:onInit',

  CHAT_ENTER: 'chat:onEnter',
  CHAT_SEND: 'chat:onChatSend',
  CHAT_SCROLL: 'chat:onChatScroll',

  CONTROL_ENTER: 'control:onEnter',
  CONTROL_INIT: 'control:onInit',
  CONTROL_IS_INTERVAL: 'control:onIsInterval',
  CONTROL_UPDATE_STATUS: 'control:onUpdateStatus',
  CONTROL_WAIT: 'control:onWait',

  EDITOR_ENTER: 'editor:onEnter',
  EDITOR_TEXT_UPDATE: 'editor:onEditorTextUpdate',
  EDITOR_CONTENT_UPDATE: 'editor:onEditorContentUpdate',
  EDITOR_SELECTION_UPDATE: 'editor:onEditorSelectionUpdate',
  EDITOR_SELECTION_REMOVE: 'editor:onEditorSelectionRemove',

  INTERVAL_CREATE: 'interval:onCreate',
  INTERVAL_REASSIGN: 'interval:onReassign',
  INTERVAL_REMIND: 'interval:onRemind',
  INTERVAL_STATUS: 'interval:onStatus',
  INTERVAL_UPDATE: 'interval:onUpdate',

  PEOPLE_ENTER: 'people:onEnter',
  PEOPLE_JOIN: 'people:onJoin',
  PEOPLE_LEAVE: 'people:onLeave',

  REDIS_EVENT: 'redis:websocket',

  SUBSCRIBE_EVENTS: {
    SOCKET_CLOSE: 'socket:onClose',
    SOCKET_DUPLICATE: 'socket:onDuplicate',

    CHAT_SEND: 'chat:onChatSend',

    CONTROL_IS_INTERVAL: 'control:onIsInterval',
    CONTROL_UPDATE_STATUS: 'control:onUpdateStatus',

    EDITOR_TEXT_UPDATE: 'editor:onEditorTextUpdate',
    EDITOR_CONTENT_UPDATE: 'editor:onEditorContentUpdate',
    EDITOR_SELECTION_UPDATE: 'editor:onEditorSelectionUpdate',
    EDITOR_SELECTION_REMOVE: 'editor:onEditorSelectionRemove',

    INTERVAL_REMIND: 'interval:onRemind',
    INTERVAL_UPDATE: 'interval:onUpdate',

    PEOPLE_JOIN: 'people:onJoin',
    PEOPLE_LEAVE: 'people:onLeave',

    REDIS_EVENT: 'redis:websocket',
  },
};
