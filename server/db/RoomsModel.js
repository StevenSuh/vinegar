const Sequelize = require('sequelize');

module.exports = (dbClient) => {
  const Rooms = sequelize.define('rooms', {
    active: Sequelize.BOOLEAN,
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: Sequelize.STRING,
    text: Sequelize.TEXT('long'),
  }, {
    freezeTableName: true,
    timestamps: true,
  });

  return Rooms;
};
