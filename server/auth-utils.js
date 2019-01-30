const {
  googleClientId: clientId,
  googleClientSecret: clientSecret,
  googleRedirect: redirectUrl,
} = require('config');
const {google} = require('googleapis');

const defaultScope = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

// helpers
let authClient = null;

const createConnection = () => {
  if (!authClient) {
    authClient = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
  }
  return authClient;
};

const getConnectUrl = auth =>
  auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope,
  });

const getGoogleOAuth2Api = auth => google.oauth2({version: 'v2', auth});

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

    const oauth2 = getGoogleOAuth2Api(auth);
    const me = await oauth2.userinfo.v2.me.get();

    const userGoogleId = me.data.id;
    const userGoogleEmail = me.data.verified_email && me.data.email;

    return {
      gid: userGoogleId,
      email: userGoogleEmail,
      tokens,
    };
  },
};
