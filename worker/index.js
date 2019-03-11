const fs = require('fs');
const path = require('path');
const Sessions = require('db/sessions/model');

const {
  addCallback,
  getWorkerId,
  publisher,
  subscriber,
} = require('services/redis');

const Pdf = require('services/pdf');

const { inflate } = require('utils');
const { CONTROL_DOWNLOAD, PDF_CREATE, SUBSCRIBE_EVENTS } = require('defs');

getWorkerId();

let styles = '';
fs.readdir(
  path.resolve(__dirname, 'node_modules', 'client-css'),
  (_err, filenames) =>
    filenames.forEach(file =>
      fs.readFileSync(
        path.resolve(__dirname, 'node_modules', 'client-css', file),
        'utf8',
        (_err2, content) => {
          styles += content;
        },
      ),
    ),
);

addCallback(PDF_CREATE, async ({ sessionId, userId, workerId }) => {
  console.log(sessionId, userId, workerId);
  if (!workerId) {
    throw new Error('workerId must be defined');
  }
  const clientWorkerId = await getWorkerId();
  if (workerId !== clientWorkerId) {
    return;
  }

  const session = await Sessions.findOne({ where: { id: sessionId } });
  const content = inflate(session.get(Sessions.CONTENT));

  const totalContent = `
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css?family=Rubik:300,400,500" rel="stylesheet">
        <style type="text/css">${styles}</style>
      </head>
      <body>
        <div class="ql-container ql-snow">
          <div class="ql-editor">${content}</div>
        </div>
      </body>
    </html>
  `;

  const pdf = new Pdf(session);
  await pdf.createPdf(totalContent);
  await pdf.generateSignedUrl();

  const { url } = pdf;
  const userIdName = `user-${userId}`;
  publisher.to(userIdName).publishEvent(CONTROL_DOWNLOAD, { url });
});

subscriber.subscribe(...Object.values(SUBSCRIBE_EVENTS));
