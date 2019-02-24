const Sequelize = require('sequelize');

let IntervalManagers = null;

module.exports = (dbClient) => {
  if (!IntervalManagers) {
    IntervalManagers = dbClient.define('intervalManagers', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
    }, {
      freezeTableName: true,
      timestamps: true,
    });

    // class definitions
    IntervalManagers.CREATED_AT = 'createdAt';
    IntervalManagers.ID = 'id';
    IntervalManagers.UPDATED_AT = 'updatedAt';
    IntervalManagers.SESSION_ID = 'sessionId';
  }
  return IntervalManagers;
};
