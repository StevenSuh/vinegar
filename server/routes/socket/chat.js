const dbClient = require('db')();

const Chats = require('db/chats/model')(dbClient);
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);


module.exports = (io, socket, session, user) => {
  const sessionId = session.get(Sessions.ID);
  const userId = user.get(Users.ID);

  const color = user.get(Users.COLOR);
  const name = user.get(Users.NAME);

  socket.on('onChatSend', (data) => {
    io.in(sessionId).emit('onChatSend', {
      ...data,
      color,
      name,
      date: Date.now(),
      type: Chats.TYPE_USER,
      userId,
    });

    Chats.create({
      color,
      message: data.msg,
      name,
      sessionId,
      type: Chats.TYPE_USER,
      userId,
    });
  });
};
