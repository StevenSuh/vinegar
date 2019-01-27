const Sequelize = require('sequelize');

module.exports = {
  // class methods
  searchFullName: async function({
    attributes,
    limit,
    offset,
    query,
  }) {
    const searchCriteria = {
      [Sequelize.Op.and]: [
        Sequelize.where(
          // concat these two columns
          Sequelize.fn('concat', Sequelize.col(this.SCHOOL_NAME), ' ', Sequelize.col(this.SESSION_NAME)),
          // case insensitive search
          { [Sequelize.Op.iLike]: `%${query}%` },
        ),
        { active: true },
      ],
    };

    return await Sessions.findAll({
      attributes,
      limit,
      offset,
      where: searchCriteria,
    });
  },

  // getter methods
  getFullName: function() {
    return `${this.getDataValue(this.SCHOOL_NAME)} ${this.getDataValue(this.SESSION_NAME)}`;
  },
};
