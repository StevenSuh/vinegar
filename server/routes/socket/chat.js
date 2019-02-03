const dbClient = require('db')();
const Chats = require('db/chats/model')(dbClient);

module.exports = (io, socket, { id: sessionId }, { id: userId }) => {
  socket.on('onChatSend', async (data) => {
    io.in(sessionId).emit('onChatSend', {
      ...data,
      type: Chats.TYPE_USER,
      userId,
    });

    await Chats.create({
      message: data.message,
      sessionId,
      type: Chats.TYPE_USER,
      userId,
    });
  });
};
