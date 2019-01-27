const Sequelize = require('sequelize');

module.exports = {
  // class methods
  findAllByFullName: async function({
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

    return await this.findAll({
      attributes,
      limit,
      offset,
      where: searchCriteria,
    });
  },
  findActiveBySchoolAndSession: async function({
    attributes,
    schoolName,
    sessionName,
  }) {
    return await this.findOne({
      attributes,
      where: {
        active: true,
        schoolName,
        sessionName,
      },
    });
  },

  // getter methods
  getFullName: function() {
    return `${this.getDataValue(this.SCHOOL_NAME)} ${this.getDataValue(this.SESSION_NAME)}`;
  },
};
