const Sessions = require('db/sessions/model');
const Users = require('db/users/model');

const {
  EDITOR_ENTER,
  EDITOR_TEXT_UPDATE,
  EDITOR_CONTENT_UPDATE,
  EDITOR_SELECTION_UPDATE,
  EDITOR_SELECTION_REMOVE,
  SOCKET_EXCEPTION,
} = require('routes/socket/defs');

const { CONTENT_UPDATE_DUR } = require('defs');
const { deflate, inflate } = require('utils');

module.exports = (_wss, ws, session, user) => {
  const sessionId = session.get(Sessions.ID);
  const sessionName = `session-${sessionId}`;

  const userId = user.get(Users.ID);
  const color = user.get(Users.COLOR);
  const name = user.get(Users.NAME);

  let updateTimeout = null;

  ws.onEvent(EDITOR_ENTER, () => {
    const sessionContent = inflate(session.get(Sessions.CONTENT));
    ws.to(sessionName).sendEvent(EDITOR_TEXT_UPDATE, { data: sessionContent });
    ws.sendEvent(EDITOR_ENTER, { content: sessionContent });

    ws.onEvent(EDITOR_TEXT_UPDATE, ({ data }) => {
      ws.to(sessionName).sendEvent(EDITOR_TEXT_UPDATE, { data });
    });

    ws.onEvent(EDITOR_CONTENT_UPDATE, (data) => {
      if (!data.content) {
        ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'Invalid editor content.' });
        return;
      }

      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(({ content }) => {
        session.update({ content: deflate(content) });
      }, CONTENT_UPDATE_DUR, data);
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
