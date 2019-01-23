const Sequelize = require('sequelize');
const uuidv4 = require('uuid/v4');

const {
  urlGoogle,
  getGoogleAccountFromCode,
} = require('../auth-utils');

const dbClient = require('../db')();
const Users = require('../db/UsersModel')(dbClient);
const Sessions = require('../db/SessionsModel')(dbClient);

module.exports = (app) => {
  // authentication
  app.get('/api/signin', (req, res) => {
    if (req.cookies.cookieId) {
      return res.json({ signinUrl: '/find' });
    }
    return res.json({ signinUrl: urlGoogle() });
  });

  app.get('/api/auth/status', async (req, res) => {
    const { cookieId } = req.cookies;
    if (!cookieId) {
      return res.json({ isAuthenticated: false });
    }

    const user = await Users.findOne({ where: { cookieId } });
    if (!user) {
      res.clearCookie('cookieId');
      return res.json({ isAuthenticated: false });
    }
    return res.json({
      isAuthenticated: true,
      uid: user.id,
    });
  });

  app.get('/callback', async (req, res) => {
    const { code } = req.query;

    const {
      gid,
      email,
      tokens: { expiry_date },
    } = await getGoogleAccountFromCode(code);

    const cookieId = uuidv4();

    // create or update user on db
    Users.upsert({
      active: false,
      email,
      gid,
      cookieId,
    });

    res.cookie('cookieId', cookieId, {
      expires: new Date(expiry_date),
      httpOnly: true,
      secure: false, // TODO: change to true
    });

    res.redirect('http://localhost:8080/find');
  });

  app.get('/api/search/session', async (req, res) => {
    const {
      limit = 5,
      offset = 0,
      query = '',
    } = req.query;

    const searchQuery = query.toLowerCase();
    const searchCriteria = {
      [Sequelize.Op.and]: [
        Sequelize.where(
          // concat these two columns
          Sequelize.fn('concat', Sequelize.col('schoolName'), Sequelize.col('sessionName')),
          // case insensitive search
          { [Sequelize.Op.iLike]: '%' + searchQuery + '%' },
        ),
        { active: true },
      ],
    }

    const sessions = await Sessions.findAll({
      limit,
      offset,
      where: searchCriteria,
    });

    const filteredSessions = sessions.filter(({
      createdAt,
      duration,
      schoolName,
      sessionName,
      id,
    }) => ({
      createdAt,
      duration,
      schoolName,
      sessionName,
      sessionId: id,
    }));

    res.json([
      {
        createdAt: '2019-01-21 23:58:35.425-08',
        duration: 60,
        schoolName: 'UCSC',
        sessionName: 'CMPS 101',
        sessionId: '1',
      },
      {
        createdAt: '2019-01-20 23:58:35.425-08',
        duration: 60,
        schoolName: 'UCSC',
        sessionName: 'CMPS 107',
        sessionId: '2',
      },
      {
        createdAt: '2019-01-19 23:58:35.425-08',
        duration: 60,
        schoolName: 'UCSC',
        sessionName: 'CMPS 102',
        sessionId: '3',
      },
      {
        createdAt: '2019-01-19 23:58:35.425-08',
        duration: 60,
        schoolName: 'UCSC',
        sessionName: 'CMPS 102',
        sessionId: '4',
      },
      {
        createdAt: '2019-01-19 23:58:35.425-08',
        duration: 60,
        schoolName: 'UCSC',
        sessionName: 'CMPS 102',
        sessionId: '5',
      },
      {
        createdAt: '2019-01-19 23:58:35.425-08',
        duration: 60,
        schoolName: 'UCSC',
        sessionName: 'CMPS 102',
        sessionId: '6',
      },
    ]);
    // res.json(filteredSessions);
  });
};