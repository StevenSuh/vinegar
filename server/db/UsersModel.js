module.exports = (dbClient) => {
  const Users = dbClient.define('users', {
    active: Sequelize.BOOLEAN,
    gid: Sequelize.STRING,
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: Sequelize.STRING,
  }, {
    freezeTableName: true,
    timestamps: true,
  });

  return Users;
};
