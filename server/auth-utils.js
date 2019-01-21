const {
  googleClientId: clientId,
  googleClientSecret: clientSecret,
  googleRedirect: redirectUrl,
} = require('./config');
const {google} = require('googleapis');

const defaultScope = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/userinfo.email',
];

// helpers
let auth = null;

const createConnection = () => {
  if (!auth) {
    auth = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
  }
  return auth;
};

const getConnectUrl = auth => {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope,
  });
};

const getGooglePlusApi = auth => {
  return google.plus({version: 'v1', auth});
};

module.exports = {
  urlGoogle: () => {
    const auth = createConnection();
    const url = getConnectUrl(auth);
    return url;
  },
  getGoogleAccountFromCode: async code => {
    const auth = createConnection();
    const {tokens} = await auth.getToken(code);

    auth.setCredentials(tokens);

    const plus = getGooglePlusApi(auth);
    const me = await plus.people.get({userId: 'me'});

    const userGoogleId = me.data.id;
    const userGoogleEmail =
      me.data.emails && me.data.emails.length && me.data.emails[0].value;

    return {
      gid: userGoogleId,
      email: userGoogleEmail,
      tokens,
    };
  },
};
