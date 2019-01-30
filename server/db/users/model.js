const Sequelize = require('sequelize');

let Users = null;

module.exports = (dbClient) => {
  if (!Users) {
    Users = dbClient.define('users', {
      active: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      email: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      gid: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        defaultValue: '',
        type: Sequelize.STRING,
      },
      phone: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      cookieId: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      sessionCookieId: {
        allowNull: true,
        type: Sequelize.STRING,
      },
    }, {
      indexes: [{ unique: true, fields: ['gid'] }],
      freezeTableName: true,
      timestamps: true,
    });

    // class definitions
    Users.ACTIVE = 'active';
    Users.COOKIE_ID = 'cookieId';
    Users.CREATED_AT = 'createdAt';
    Users.EMAIL = 'email';
    Users.GID = 'gid';
    Users.ID = 'id';
    Users.NAME = 'name';
    Users.PHONE = 'phone';
    Users.UPDATED_AT = 'updatedAt';
  }
  return Users;
};
