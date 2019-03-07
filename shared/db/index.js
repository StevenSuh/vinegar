const Chats = require('./chats/model');
const Intervals = require('./intervals/model');
const Sessions = require('./sessions/model');
const Users = require('./users/model');

(async () => {
  // create tables
  await Chats.sync({ alter: false, force: false });
  await Intervals.sync({ alter: false, force: false });
  await Sessions.sync({ alter: false, force: false });
  await Users.sync({ alter: false, force: false });

  // associations
  Sessions.hasMany(Chats, {
    as: 'Chats',
    foreignKey: { allowNull: false, name: 'sessionId' },
    onDelete: 'cascade',
  });
  Users.hasMany(Chats, {
    as: 'Chats',
    foreignKey: { allowNull: false, name: 'userId' },
  });

  Intervals.belongsTo(Users, {
    as: 'User',
    foreignKey: { allowNull: false, name: 'userId' },
  });
  Sessions.belongsTo(Intervals, {
    as: 'CurrentInterval',
    foreignKey: { allowNull: true, name: 'currentIntervalId' },
  });
  Sessions.hasMany(Intervals, {
    as: 'Intervals',
    foreignKey: { allowNull: false, name: 'sessionId' },
    onDelete: 'cascade',
  });

  Sessions.belongsTo(Users, {
    as: 'Owner',
    foreignKey: { allowNull: false, name: 'ownerId' },
  });
  Sessions.hasMany(Users, {
    as: 'Users',
    foreignKey: { allowNull: true, name: 'sessionId' },
  });

  // with association
  await Chats.sync({ alter: true, force: false });
  await Intervals.sync({ alter: true, force: false });
  await Users.sync({ alter: true, force: false });
  await Sessions.sync({ alter: true, force: false });
})();
