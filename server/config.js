module.exports = {
  googleClientId:
    process.env.GOOGLE_CLIENT_ID ||
    '162658294798-6ahaoueb6ve1lglih3uik2dbk1rdpsvc.apps.googleusercontent.com',
  googleClientSecret:
    process.env.GOOGLE_CLIENT_SECRET || 'uQihD1VPhpw2D7HMPJXYjRfl',
  googleRedirect:
    process.env.GOOGLE_REDIRECT_URL || 'http://localhost:3000/api/callback',
  pgDbName: process.env.POSTGRES_DATABASE_NANE || 'vinegar',
  pgUsername: process.env.POSTGRES_USERNAME || 'stevensuh',
  pgPassword: process.env.POSTGRES_PASSWORD || '123456789a',
};
