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
  
    socket.on('onEditorUpdate', function({ data, room }) {
      socket.broadcast.to(room).emit('onEditorUpdate', data);
    });
  });

  return httpServer;
};
