import Sequelize from 'sequelize';

let Users = null;

module.exports = (dbClient) => {
  if (!Users) {
    Users = dbClient.define('users', {
      active: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
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
        type: Sequelize.STRING,
      },
      // roomId,
    }, {
      freezeTableName: true,
      timestamps: true,
    });
  }
  return Users;
};
