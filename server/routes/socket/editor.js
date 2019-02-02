module.exports = (_io, socket, { id: sessionId }, { id: userId }) => {
  socket.on('editor:onEditorTextUpdate', ({ data }) => {
    socket.broadcast.to(sessionId).emit('editor:onEditorTextUpdate', { data, userId });
  });

  socket.on('editor:onEditorSelectionUpdate', ({ data, name }) => {
    socket.broadcast.to(sessionId).emit('onEditorSelectionUpdate', { data, name, userId });
  });

  socket.on('editor:onEditorSelectionRemove', () => {
    socket.broadcast.to(sessionId).emit('editor:onEditorSelectionRemove', { userId });
  });
};
