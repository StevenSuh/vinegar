const http = require('http');
const SocketIo = require('socket.io');

module.exports = (app) => {
  const httpServer = http.Server(app);
  const io = SocketIo(httpServer);

  io.on('connection', function(socket) {
    socket.on('joinSession', function({ session }) {
      if (!(/[^\w.]/.test(session))) {
        socket.join(session);
      }
    });

    socket.on('onEditorTextUpdate', function({ data, session }) {
      socket.broadcast.to(session).emit('onEditorTextUpdate', data);
    });

    socket.on('onEditorSelectionUpdate', function({ data, name, session, userId }) {
      socket.broadcast.to(session).emit('onEditorSelectionUpdate', {
        data,
        name,
        userId,
      });
    });

    socket.on('onEditorSelectionRemove', function({ session, userId }) {
      socket.broadcast.to(session).emit('onEditorSelectionRemove', { userId });
    });
  });

  return httpServer;
};