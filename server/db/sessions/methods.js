const Sequelize = require('sequelize');

module.exports = {
  // class methods
  async findAllByFullName({
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

    return this.findAll({
      attributes,
      limit,
      offset,
      where: searchCriteria,
    });
  },
  async findActiveBySchoolAndSession({
    attributes,
    schoolName,
    sessionName,
  }) {
    return this.findOne({
      attributes,
      where: {
        active: true,
        schoolName,
        sessionName,
      },
    });
  },

  // getter methods
  getFullName() {
    return `${this.get(this.SCHOOL_NAME)} ${this.get(this.SESSION_NAME)}`;
  },
};
