const { Storage } = require('@google-cloud/storage');
const pdf = require('html-pdf');

const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);

const { BUCKET_NAME } = require('defs');

class PdfCreator {
  constructor(session) {
    this.session = session;
    this.school = session.get(Sessions.SCHOOL_NAME);
    this.session = session.get(Sessions.SESSION_NAME);

    this.filename = `${this.school}/${this.session}-${Date.now()}`;
    this.url = null;
    this.stream = null;

    this.storage = new Storage();
  }

  createPdf(html) {
    return new Promise(function(resolve, reject) {
        pdf.create(html).toStream(function(err, stream) {
        if (err) {
          console.error('An error has occurred at createPdf');
          reject(err);
        }
        this.stream = stream;
        resolve();
      })
    });
  }

  savePdf() {
    const storageFile = this.storage.bucket(BUCKET_NAME).file(this.filename);

    return new Promise(function(resolve, reject) {
      this.stream
        .pipe(storageFile.createWriteStream({ gzip: true }))
        .on('finish', function() {
          resolve();
        })
        .on('error', function(err) {
          console.error('An error has occurred at savePdf');
          reject(err);
        })
        .end();
    });
  }

  async generateSignedUrl() {
    const options = {
      action: 'read',
      expires: Date.now() + 1000 * 60 * 5, // 5 minutes
    };

    const [url] = await this.storage
      .bucket(BUCKET_NAME)
      .file(this.filename)
      .getSignedUrl(options);

    this.url = url;
  }
}

module.exports = PdfCreator;
