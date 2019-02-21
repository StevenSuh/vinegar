module.exports = {
  SOCKET_DUPLICATE: 'socket:onDuplicate',
  SOCKET_ENTER: 'socket:onEnter',
  SOCKET_EXCEPTION: 'socket:onException',
  SOCKET_INIT: 'socket:onInit',

  CHAT_SEND: 'chat:onChatSend',
  CHAT_SCROLL: 'chat:onChatScroll',

  CONTROL_INIT: 'control:onInit',
  CONTROL_UPDATE: 'control:onUpdate',

  EDITOR_ENTER: 'editor:onEnter',
  EDITOR_TEXT_UPDATE: 'editor:onEditorTextUpdate',
  EDITOR_CONTENT_UPDATE: 'editor:onEditorContentUpdate',
  EDITOR_SELECTION_UPDATE: 'editor:onEditorSelectionUpdate',
  EDITOR_SELECTION_REMOVE: 'editor:onEditorSelectionRemove',

  REDIS_EVENT: 'redis:websocket',

  SUBSCRIBE_EVENTS: {
    SOCKET_DUPLICATE: 'socket:onDuplicate',

    CHAT_SEND: 'chat:onChatSend',

    CONTROL_UPDATE: 'control:onUpdate',

    EDITOR_TEXT_UPDATE: 'editor:onEditorTextUpdate',
    EDITOR_CONTENT_UPDATE: 'editor:onEditorContentUpdate',
    EDITOR_SELECTION_UPDATE: 'editor:onEditorSelectionUpdate',
    EDITOR_SELECTION_REMOVE: 'editor:onEditorSelectionRemove',

    REDIS_EVENT: 'redis:websocket',
  },
};
