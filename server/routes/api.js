const {
  urlGoogle,
  getGoogleAccountFromCode,
} = require('../auth-utils');

module.exports = (app) => {
  // authentication
  app.get('/api/signin', (_req, res) => {
    res.json({ signinUrl: urlGoogle() });
  });

  app.get('/callback', async (req, res) => {
    const { code } = req.query;

    const {
      gid,
      email,
      tokens: {
        access_token,
        expiry_date,
      },
    } = await getGoogleAccountFromCode(code);

    // create user on db
    // fjldsjfadls;jflds

    res.cookie('access_token', access_token, {
      expires: new Date(expiry_date),
      httpOnly: true,
      secure: false, // TODO: change to true
    });

    res.redirect('http://localhost:8080/#/editor');
  });
};
