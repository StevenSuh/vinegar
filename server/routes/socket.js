const http = require('http');
const SocketIo = require('socket.io');

module.exports = (app) => {
  const httpServer = http.Server(app);
  const io = SocketIo(httpServer);

  io.on('connection', function(socket) {
    socket.on('joinRoom', function({ room }) {
      if (!(/[^\w.]/.test(room))) {
        socket.join(room);
      }
    });
  
    socket.on('onEditorTextUpdate', function({ data, room }) {
      socket.broadcast.to(room).emit('onEditorTextUpdate', data);
    });

    socket.on('onEditorSelectionUpdate', function({ data, name, room, userId }) {
      socket.broadcast.to(room).emit('onEditorSelectionUpdate', {
        data,
        name,
        userId,
      });
    });

    socket.on('onEditorSelectionRemove', function({ room, userId }) {
      socket.broadcast.to(room).emit('onEditorSelectionRemove', { userId });
    });
  });

  return httpServer;
};
