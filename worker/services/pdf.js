const { Storage } = require('@google-cloud/storage');
const pdf = require('html-pdf');
const phantomPath = require('phantomjs-prebuilt').path;

const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);

const { BUCKET_NAME } = require('defs');

const options = {
  border: "0.2in",
  phantomPath,
};

class PdfCreator {
  constructor(session) {
    this.session = session;
    this.school = session.get(Sessions.SCHOOL_NAME);
    this.session = session.get(Sessions.SESSION_NAME);

    this.filename = `${this.school}-${this.session}.pdf`;
    this.url = null;
    this.stream = null;

    this.storage = new Storage();
  }

  createPdf(html) {
    return new Promise((resolve, reject) => {
      pdf.create(html, options).toStream((err, stream) => {
        if (err) {
          console.error('An error has occurred at createPdf');
          reject(err);
        }
        this.stream = stream;
        resolve();
      });
    });
  }

  savePdf() {
    return new Promise((resolve, reject) => {
      const storageFile = this.storage.bucket(BUCKET_NAME).file(this.filename);
      this.stream
        .pipe(storageFile.createWriteStream({ gzip: true }))
        .on('finish', resolve)
        .on('error', reject);
    });
  }

  async generateSignedUrl() {
    const urlOptions = {
      action: 'read',
      expires: Date.now() + 1000 * 60 * 5, // 5 minutes
    };

    const [url] = await this.storage
      .bucket(BUCKET_NAME)
      .file(this.filename)
      .getSignedUrl(urlOptions);

    this.url = url;
  }
}

module.exports = PdfCreator;
