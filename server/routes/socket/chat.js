const dbClient = require('db')();

const Chats = require('db/chats/model')(dbClient);
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);


module.exports = (io, socket, session, user) => {
  const sessionId = session.get(Sessions.ID);
  const userId = user.get(Users.ID);

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
