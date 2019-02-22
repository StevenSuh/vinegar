module.exports = {
  SOCKET_DUPLICATE: 'socket:onDuplicate',
  SOCKET_ENTER: 'socket:onEnter',
  SOCKET_EXCEPTION: 'socket:onException',
  SOCKET_INIT: 'socket:onInit',

  CHAT_SEND: 'chat:onChatSend',
  CHAT_SCROLL: 'chat:onChatScroll',

  CONTROL_INIT: 'control:onInit',
  CONTROL_UPDATE_STATUS: 'control:onUpdateStatus',

  EDITOR_ENTER: 'editor:onEnter',
  EDITOR_TEXT_UPDATE: 'editor:onEditorTextUpdate',
  EDITOR_CONTENT_UPDATE: 'editor:onEditorContentUpdate',
  EDITOR_SELECTION_UPDATE: 'editor:onEditorSelectionUpdate',
  EDITOR_SELECTION_REMOVE: 'editor:onEditorSelectionRemove',

  PEOPLE_ENTER: 'people:onEnter',
  PEOPLE_LEAVE: 'people:onLeave',

  REDIS_EVENT: 'redis:websocket',

  SUBSCRIBE_EVENTS: {
    SOCKET_DUPLICATE: 'socket:onDuplicate',

    CHAT_SEND: 'chat:onChatSend',

    CONTROL_UPDATE_STATUS: 'control:onUpdateStatus',

    EDITOR_TEXT_UPDATE: 'editor:onEditorTextUpdate',
    EDITOR_CONTENT_UPDATE: 'editor:onEditorContentUpdate',
    EDITOR_SELECTION_UPDATE: 'editor:onEditorSelectionUpdate',
    EDITOR_SELECTION_REMOVE: 'editor:onEditorSelectionRemove',

    PEOPLE_ENTER: 'people:onEnter',
    PEOPLE_LEAVE: 'people:onLeave',

    REDIS_EVENT: 'redis:websocket',
  },
};
