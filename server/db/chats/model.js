const Sequelize = require('sequelize');

let Chats = null;

module.exports = (dbClient) => {
  if (!Chats) {
    Chats = dbClient.define('chats', {
      message: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.STRING,
      },
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
    }, {
      freezeTableName: true,
      timestamps: true,
    });

    // class definitions
    Chats.CREATED_AT = 'createdAt';
    Chats.ID = 'id';
    Chats.MESSAGE = 'message';
    Chats.UPDATED_AT = 'updatedAt';
  }
  return Chats;
};
