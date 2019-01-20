const Sequelize = require('sequelize');

let Rooms = null;

module.exports = (dbClient) => {
  if (!Rooms) {
    Rooms = dbClient.define('rooms', {
      active: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      text: {
        allowNull: false,
        defaultValue: '',
        type: Sequelize.TEXT('long'),
      },
    }, {
      freezeTableName: true,
      timestamps: true,
    });
  }
  return Rooms;
};
