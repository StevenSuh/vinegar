const { CONTENT_UPDATE_DUR } = require('defs');

const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

module.exports = (_io, socket, session, user) => {
  const sessionId = session.get(Sessions.ID);
  const userId = user.get(Users.ID);
  const name = user.get(Users.NAME);

  const sessionName = `session-${sessionId}`;

  let updateTimeout = null;

  socket.on('editor:onEnter', () => {
    socket.on('editor:onEditorTextUpdate', ({ data }) => {
      socket.broadcast.to(sessionName).emit('editor:onEditorTextUpdate', { data, userId });
    });

    socket.on('editor:onEditorContentUpdate', data => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(async content => {
        session.update({ content });
      }, CONTENT_UPDATE_DUR, data);
    });

    socket.on('editor:onEditorSelectionUpdate', ({ data }) => {
      socket.broadcast.to(sessionName).emit('editor:onEditorSelectionUpdate', { data, name, userId });
    });

    socket.on('editor:onEditorSelectionRemove', () => {
      socket.broadcast.to(sessionName).emit('editor:onEditorSelectionRemove', { userId });
    });
  });
};
