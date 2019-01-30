module.exports = (_io, socket, { id: sessionId }, { id: userId }) => {
  socket.on('onEditorTextUpdate', function({ data }) {
    socket.broadcast.to(sessionId).emit('onEditorTextUpdate', {data, userId});
  });

  socket.on('onEditorSelectionUpdate', function({ data, name }) {
    socket.broadcast.to(sessionId).emit('onEditorSelectionUpdate', {data, name, userId});
  });

  socket.on('onEditorSelectionRemove', function() {
    socket.broadcast.to(sessionId).emit('onEditorSelectionRemove', {userId});
  });
};
