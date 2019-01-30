module.exports = (_io, socket, { id: sessionId }, { id: userId }) => {
  socket.on('onEditorTextUpdate', ({ data }) => {
    socket.broadcast.to(sessionId).emit('onEditorTextUpdate', { data, userId });
  });

  socket.on('onEditorSelectionUpdate', ({ data, name }) => {
    socket.broadcast.to(sessionId).emit('onEditorSelectionUpdate', { data, name, userId });
  });

  socket.on('onEditorSelectionRemove', () => {
    socket.broadcast.to(sessionId).emit('onEditorSelectionRemove', { userId });
  });
};
