const { CONTENT_UPDATE_DUR } = require('defs');

const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

const {
  EDITOR_ENTER,
  EDITOR_TEXT_UPDATE,
  EDITOR_CONTENT_UPDATE,
  EDITOR_SELECTION_UPDATE,
  EDITOR_SELECTION_REMOVE,
} = require('routes/socket/defs');

const { deflate } = require('utils');

module.exports = (_wss, ws, session, user) => {
  const sessionId = session.get(Sessions.ID);
  const sessionName = `session-${sessionId}`;

  const userId = user.get(Users.ID);
  const color = user.get(Users.COLOR);
  const name = user.get(Users.NAME);

  let updateTimeout = null;

  ws.onEvent(EDITOR_ENTER, () => {
    ws.onEvent(EDITOR_TEXT_UPDATE, ({ data }) => {
      ws.to(sessionName).sendEvent(EDITOR_TEXT_UPDATE, { data, userId });
    });

    ws.onEvent(EDITOR_CONTENT_UPDATE, data => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(async ({ content }) => {
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
