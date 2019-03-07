const Sequelize = require('sequelize');

module.exports = {
  // class methods
  async findAllByFullName({
    limit,
    offset,
    query,
  }) {
    const searchCriteria = {
      where: Sequelize.where(
        // concat these two columns
        Sequelize.fn('concat', Sequelize.col(this.SCHOOL_NAME), ' ', Sequelize.col(this.SESSION_NAME)),
        // case insensitive search
        { [Sequelize.Op.iLike]: `%${query}%` },
      ),
    };

    return this.findAll({
      limit,
      offset,
      order: [[Sessions.CREATED_AT, 'ASC']],
      where: searchCriteria,
    });
  },
  async findBySchoolAndSession({
    schoolName,
    sessionName,
  }) {
    return this.findOne({
      where: {
        schoolName,
        sessionName,
      },
    });
  },
};
