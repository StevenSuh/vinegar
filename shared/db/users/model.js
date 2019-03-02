const Sequelize = require('sequelize');

let Users = null;

module.exports = (dbClient) => {
  if (!Users) {
    Users = dbClient.define('users', {
      active: {
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      color: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      email: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        defaultValue: '',
        type: Sequelize.STRING,
      },
      phone: {
        allowNull: true,
        type: Sequelize.STRING,
      },
    }, {
      freezeTableName: true,
      timestamps: true,
    });

    // class definitions
    Users.ACTIVE = 'active';
    Users.COLOR = 'color';
    Users.CREATED_AT = 'createdAt';
    Users.EMAIL = 'email';
    Users.ID = 'id';
    Users.NAME = 'name';
    Users.PHONE = 'phone';
    Users.UPDATED_AT = 'updatedAt';
  }
  return Users;
};
