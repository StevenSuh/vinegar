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
const cssFiles = fs.readdirSync(
  path.resolve(__dirname, 'node_modules', 'client-css'),
);
cssFiles.forEach(file => {
  styles += fs.readFileSync(
    path.resolve(__dirname, 'node_modules', 'client-css', file),
    'utf8',
  );
});

addCallback(PDF_CREATE, async ({ sessionId, userId, workerId }) => {
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
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css?family=Rubik:300,400,500" rel="stylesheet">
        <style type="text/css">
          @font-face {
            font-family: 'Times New Roman';
            src: url("https://raw.githubusercontent.com/StevenSuh/vinegar/master/shared/fonts/Times%20New%20Roman.ttf");
          }
          @font-face {
            font-family: 'Arial';
            src: url("https://raw.githubusercontent.com/StevenSuh/vinegar/master/shared/fonts/Arial.ttf");
          }
          @font-face {
            font-family: 'Courier New';
            src: url("https://raw.githubusercontent.com/StevenSuh/vinegar/master/shared/fonts/Courier%20New.ttf");
          }
          .ql-align-center {
            text-align: center;
          }
        </style>
        <style type="text/css">${styles}</style>
        </head>
      <body style="width: 100vw;">
        <div class="ql-container ql-snow" style="border: none;">
          <div class="ql-editor" style="border: none;">${content}</div>
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
