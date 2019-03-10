const Chats = require('db/chats/model');
const Sessions = require('db/sessions/model');
const Users = require('db/users/model');

const { getChats } = require('routes/socket/utils');

const {
  DEFAULT_COLOR,
  DEFAULT_ENTER_MSG,
  DEFAULT_IDLE_MSG,
  DEFAULT_REMIND_MSG,
} = require('defs');
const {
  CHAT_ENTER,
  CHAT_SEND,
  CHAT_SCROLL,
  IDLE_REMIND,
  INTERVAL_REMIND,
  SOCKET_EXCEPTION,
} = require('routes/socket/defs');

module.exports = async (wss, ws, session, user) => {
  const sessionId = session.get(Sessions.ID);
  const userId = user.get(Users.ID);

  const sessionName = `session-${sessionId}`;

  const color = user.get(Users.COLOR);
  const name = user.get(Users.NAME);

  const enterChat = await Chats.create({
    color,
    message: DEFAULT_ENTER_MSG,
    name,
    sessionId: session.get(Sessions.ID),
    type: Chats.TYPE_SYSTEM,
    userId,
  });

  const { createdAt: date, message: msg, type: chatType } = enterChat.get();
  ws.to(sessionName).sendEvent(CHAT_SEND,
    { color, msg, name, date, type: chatType, userId });

  const messages = await getChats(session);
  ws.sendEvent(CHAT_ENTER, {
    hasMore: messages.length > 10,
    msgs: (messages.length > 10) ? messages.slice(1) : messages,
  });

  ws.onEvent(CHAT_SEND, async (data) => {
    wss.to(sessionName).sendEvent(CHAT_SEND, {
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

  ws.onEvent(CHAT_SCROLL, async ({ offset }) => {
    if (!offset) {
      ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'Invalid number of offset.' });
      return;
    }

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

    ws.sendEvent(CHAT_SCROLL, {
      hasMore: (msgs.length > 10),
      msgs: (msgs.length > 10) ? msgs.slice(1) : msgs,
    });
  });

  ws.onServer(INTERVAL_REMIND, async () => {
    const schoolEnding = session.get(Sessions.SCHOOL_NAME);
    const sessionEnding = session.get(Sessions.SESSION_NAME);

    wss.to(sessionName).sendEvent(CHAT_SEND, {
      color: DEFAULT_COLOR,
      msg: DEFAULT_REMIND_MSG,
      name: `${schoolEnding}/${sessionEnding}`,
      date: Date.now(),
      type: Chats.TYPE_SYSTEM,
      userId,
    });

    await Chats.create({
      color: DEFAULT_COLOR,
      message: DEFAULT_REMIND_MSG,
      name: `${schoolEnding}/${sessionEnding}`,
      sessionId: session.get(Sessions.ID),
      type: Chats.TYPE_SYSTEM,
      userId,
    });
  });

  ws.onServer(IDLE_REMIND, async () => {
    const schoolEnding = session.get(Sessions.SCHOOL_NAME);
    const sessionEnding = session.get(Sessions.SESSION_NAME);

    wss.to(sessionName).sendEvent(CHAT_SEND, {
      color: DEFAULT_COLOR,
      msg: DEFAULT_IDLE_MSG,
      name: `${schoolEnding}/${sessionEnding}`,
      date: Date.now(),
      type: Chats.TYPE_SYSTEM,
      userId,
    });

    await Chats.create({
      color: DEFAULT_COLOR,
      message: DEFAULT_IDLE_MSG,
      name: `${schoolEnding}/${sessionEnding}`,
      sessionId: session.get(Sessions.ID),
      type: Chats.TYPE_SYSTEM,
      userId,
    });
  });
};
