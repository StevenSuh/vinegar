const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);

const { addCallback, publisher, subscriber } = require('services/redis');

const Pdf = require('services/pdf');

const { CONTROL_DOWNLOAD, PDF_CREATE, SUBSCRIBE_EVENTS } = require('defs');

addCallback(PDF_CREATE, async ({ sessionId, style, userId }) => {
  const session = await Sessions.findOne({ where: { id: sessionId } });
  const userIdName = `user-${userId}`;
  const content = session.get(Sessions.CONTENT);

  const totalContent = `${style}<div class="ql-editor">${content}</div>`;

  const pdf = new Pdf(session);
  await pdf.createPdf(totalContent);
  await pdf.savePdf();
  await pdf.generateSignedUrl();

  const { url } = pdf;
  publisher.to(userIdName).publishEvent(CONTROL_DOWNLOAD, { url });
});

subscriber.subscribe(...Object.values(SUBSCRIBE_EVENTS));
