const { SOCKET_EXCEPTION } = require('./defs');

const requireSessionOwner = (ws, { ownerId, userId }) => {
  const isOwner = ownerId === userId;

  if (!isOwner) {
    ws.sendEvent(SOCKET_EXCEPTION, { errorMessage: 'Current user is not the owner of the session.' });
    ws.close();
    throw new Error('Current user is not the owner of the session.');
  }
};

module.exports = {
  requireSessionOwner,
};
