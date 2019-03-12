const Sessions = require('db/sessions/model');
const Users = require('db/users/model');

const {
  EDITOR_ENTER,
  EDITOR_TEXT_UPDATE,
  EDITOR_CONTENT_REQUEST,
  EDITOR_CONTENT_UPDATE,
  EDITOR_SELECTION_UPDATE,
  EDITOR_SELECTION_REMOVE,
  SOCKET_EXCEPTION,
} = require('routes/socket/defs');

const { deflate, inflate } = require('utils');

module.exports = (_wss, ws, session, user) => {
  const sessionId = session.get(Sessions.ID);
  const sessionName = `session-${sessionId}`;

  const userId = user.get(Users.ID);
  const color = user.get(Users.COLOR);
  const name = user.get(Users.NAME);

  ws.onEvent(EDITOR_ENTER, () => {
    const sessionContent = inflate(session.get(Sessions.CONTENT));
    ws.to(sessionName).sendEvent(EDITOR_TEXT_UPDATE, { data: sessionContent });
    ws.sendEvent(EDITOR_ENTER, { content: sessionContent });

    ws.onEvent(EDITOR_TEXT_UPDATE, ({ data }) => {
      ws.to(sessionName).sendEvent(EDITOR_TEXT_UPDATE, { data });
    });

    ws.onEvent(EDITOR_CONTENT_UPDATE, ({ content }) => {
      if (!content) {
        ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'Invalid editor content.' });
        return;
      }
      ws.to(sessionName).sendEvent(EDITOR_CONTENT_REQUEST, { content });
      session.update({ content: deflate(content) });
    });

    ws.onEvent(EDITOR_CONTENT_REQUEST, async () => {
      session = await session.reload();
      const content = inflate(session.get(Sessions.CONTENT));
      ws.sendEvent(EDITOR_CONTENT_REQUEST, { content });
    });

    ws.onEvent(EDITOR_SELECTION_UPDATE, ({ data }) => {
      ws.to(sessionName).sendEvent(EDITOR_SELECTION_UPDATE, { color, data, name, userId });
    });

    ws.onEvent(EDITOR_SELECTION_REMOVE, () => {
      ws.to(sessionName).sendEvent(EDITOR_SELECTION_REMOVE, { userId });
    });

    ws.on('close', () => {
      ws.to(sessionName).sendEvent(EDITOR_SELECTION_REMOVE, { userId });
    });
  });
};
