const Sequelize = require('sequelize');

const TYPES = ['system', 'user'];
let Chats = null;

module.exports = (dbClient) => {
  if (!Chats) {
    Chats = dbClient.define('chats', {
      message: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
          isOneOf(value) {
            if (!TYPES.includes(value)) {
              throw new Error(`${value} is not one of the allowed chat type defined in ${TYPES}`);
            }
          },
        }
      },
    }, {
      freezeTableName: true,
      timestamps: true,
    });

    // class definitions
    Chats.CREATED_AT = 'createdAt';
    Chats.ID = 'id';
    Chats.MESSAGE = 'message';
    Chats.TYPE = 'type';
    Chats.UPDATED_AT = 'updatedAt';

    Chats.TYPE_SYSTEM = 'system';
    Chats.TYPE_USER = 'system';
  }
  return Chats;
};
