const dbClient = require('db')();
const Chats = require('db/chats/model')(dbClient);

module.exports = (io, socket, { id: sessionId }, { id: userId }) => {
  socket.on('onChatSend', async function(data){
    io.in(sessionId).emit('onChatSend', data);

    await Chats.create({
      message: data.message,
      sessionId: sessionId,
      userId: userId,
    });
  })
};
