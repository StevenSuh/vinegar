const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);

const {
  addCallback,
  getWorkerId,
  publisher,
  subscriber,
} = require('services/redis');

const Pdf = require('services/pdf');

const { inflate } = require('utils');
const { CONTROL_DOWNLOAD, PDF_CREATE, SUBSCRIBE_EVENTS } = require('defs');

addCallback(PDF_CREATE, async ({ sessionId, style, userId, workerId }) => {
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
    <html style="-webkit-print-color-adjust: exact;">
      <head>${style}</head>
      <body style="background-color: white; -webkit-print-color-adjust: exact;">
        <div class="ql-editor" style="-webkit-print-color-adjust: exact;">${content}</div>
      </body>
    </html>
  `;

  const pdf = new Pdf(session);
  await pdf.createPdf(totalContent);
  await pdf.savePdf();
  await pdf.generateSignedUrl();

  const { url } = pdf;
  const userIdName = `user-${userId}`;
  publisher.to(userIdName).publishEvent(CONTROL_DOWNLOAD, { url });
});

subscriber.subscribe(...Object.values(SUBSCRIBE_EVENTS));
