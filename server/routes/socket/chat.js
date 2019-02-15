const dbClient = require('db')();

const Chats = require('db/chats/model')(dbClient);
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const { DEFAULT_ENTER_MSG } = require('defs');

module.exports = async (io, socket, session, user) => {
  const sessionId = session.get(Sessions.ID);
  const userId = user.get(Users.ID);

  const sessionName = `session-${sessionId}`;

  const color = user.get(Users.COLOR);
  const name = user.get(Users.NAME);

  const enterChat = await Chats.create({
    color: user.get(Users.COLOR),
    message: DEFAULT_ENTER_MSG,
    name: user.get(Users.NAME),
    sessionId: session.get(Sessions.ID),
    type: Chats.TYPE_SYSTEM,
    userId: user.get(Users.ID),
  });

  if (!enterChat) {
    throw new Error('Failed to create enter chat');
  }

  socket.on('chat:onChatSend', async (data) => {
    io.in(sessionName).emit('chat:onChatSend', {
      ...data,
      color,
      name,
      date: Date.now(),
      type: Chats.TYPE_USER,
      userId,
    });

    await Chats.create({
      color,
      message: data.msg,
      name,
      sessionId,
      type: Chats.TYPE_USER,
      userId,
    });
  });

  socket.on('chat:onChatScroll', async ({ offset }) => {
    const chats = await Chats.findAll({
      limit: 11,
      offset,
      order: [[Chats.CREATED_AT, 'DESC']],
      where: { sessionId: session.get(Sessions.ID) },
    });

    const msgs = chats.map(chat => {
      const {
        color: userColor,
        createdAt,
        message,
        name: userName,
        type,
      } = chat.get();

      return {
        color: userColor,
        date: createdAt,
        msg: message,
        name: userName,
        type,
        userId,
      };
    }).reverse();

    socket.emit('chat:onChatScroll', {
      hasMore: (msgs.length > 10),
      msgs: (msgs.length > 10) ? msgs.slice(1) : msgs,
    });
  });

  // not sure yet
  // socket.on('disconnect', async () => {
  //   io.in(sessionName).emit('chat:onChatSend', {
  //     color,
  //     message: DEFAULT_LEAVE_MSG,
  //     name,
  //     date: Date.now(),
  //     type: Chats.TYPE_USER,
  //     userId,
  //   });

  //   await Chats.create({
  //     color,
  //     message: DEFAULT_LEAVE_MSG,
  //     name,
  //     sessionId,
  //     type: Chats.TYPE_SYSTEM,
  //     userId,
  //   });
  // });
};
