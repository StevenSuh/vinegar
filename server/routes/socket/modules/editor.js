const Sessions = require('db/sessions/model');
const Users = require('db/users/model');

const {
  EDITOR_ENTER,
  EDITOR_CONTENT_UPDATE,
  EDITOR_TEXT_UPDATE,
  EDITOR_SELECTION_UPDATE,
  EDITOR_SELECTION_REMOVE,
} = require('routes/socket/defs');

const { deflate, inflate, tryCatch } = require('utils');

module.exports = (wss, ws, session, user) => {
  const sessionId = session.get(Sessions.ID);
  const sessionName = `session-${sessionId}`;

  const userId = user.get(Users.ID);
  const color = user.get(Users.COLOR);
  const name = user.get(Users.NAME);

  let updateTimeout = null;

  ws.onEvent(EDITOR_ENTER, () => {
    const sessionContent = tryCatch(
      () => JSON.parse(inflate(session.get(Sessions.CONTENT))),
      () => '',
    );

    ws.sendEvent(EDITOR_ENTER, { content: sessionContent });

    ws.onEvent(EDITOR_TEXT_UPDATE, ({ data, content }) => {
      ws.to(sessionName).sendEvent(EDITOR_TEXT_UPDATE, { data, userId });
      ws.to(sessionName).sendServer(EDITOR_TEXT_UPDATE);

      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        const contentStr = tryCatch(
          () => JSON.stringify(content),
          () => '',
        );
        session.update({ content: deflate(contentStr) });
        wss.to(sessionName).sendEvent(EDITOR_CONTENT_UPDATE, { data: content });
      }, 1000);
    });

    ws.onServer(EDITOR_TEXT_UPDATE, () => {
      clearTimeout(updateTimeout);
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
