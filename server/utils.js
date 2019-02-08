const {
  googleClientId: clientId,
  googleClientSecret: clientSecret,
  googleRedirect: redirectUrl,
} = require('config');
const { google } = require('googleapis');
const morgan = require('morgan');

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

const getGoogleOAuth2Api = auth => google.oauth2({ version: 'v2', auth });

module.exports = {
  urlGoogle: () => {
    const auth = createConnection();
    const url = getConnectUrl(auth);
    return url;
  },
  getGoogleAccountFromCode: async code => {
    const auth = createConnection();
    const { tokens } = await auth.getToken(code);

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
  enableResBody: (_req, res, next) => {
    // from https://stackoverflow.com/questions/19215042/express-logging-response-body
    // the `res` obj does not have `body` property unlike `req`
    const oldWrite = res.write;
    const oldEnd = res.end;

    const chunks = [];

    res.write = function newWrite(...args) {
      chunks.push(Buffer.from(args[0]));
      oldWrite.apply(res, args);
    };

    res.end = function newEnd(...args) {
      if (args[0]) {
        chunks.push(Buffer.from(args[0]));
      }

      try {
        const body = JSON.parse(
          Buffer.concat(chunks).toString('ascii') || '{}',
        );
        res.body = body;
      } catch (e) {
        res.body = {};
      }

      oldEnd.apply(res, args);
    };
    next();
  },
  customMorgan: () => {
    morgan.token('reqBody', req => JSON.stringify(req.body));
    morgan.token('resBody', res => JSON.stringify(res.body));

    return morgan((tokens, req, res) => {
      // :method :url :status :res[content-length] - :response-time ms
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms',
        tokens.resBody(req),
        tokens.reqBody(res),
      ].join(' ');
    });
  },
};
