const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);
const Users = require('db/users/model')(dbClient);

module.exports = (_io, socket, session, user) => {
  const sessionId = session.get(Sessions.ID);
  const userId = user.get(Users.ID);
  const name = user.get(Users.NAME);

  let updateTimeout = null;

  socket.on('editor:onEnter', () => {
    socket.on('editor:onEditorTextUpdate', ({ data, content }) => {
      socket.broadcast.to(sessionId).emit('editor:onEditorTextUpdate', { data, userId });

      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(newContent => {
        session.update(newContent);
      }, 1000, { content });
    });

    socket.on('editor:onEditorSelectionUpdate', ({ data }) => {
      socket.broadcast.to(sessionId).emit('editor:onEditorSelectionUpdate', { data, name, userId });
    });

    socket.on('editor:onEditorSelectionRemove', () => {
      socket.broadcast.to(sessionId).emit('editor:onEditorSelectionRemove', { userId });
    });
  });
};
