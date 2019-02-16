const requireSessionOwner = (socket, { ownerId, userId }) => {
  const isOwner = ownerId === userId;

  if (!isOwner) {
    socket.emit('socket:onException', { errorMessage: 'Current user is not the owner of the session.' });
    throw new Error('Current user is not the owner of the session.');
  }
};

module.exports = {
  requireSessionOwner,
};
