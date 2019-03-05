const { Storage } = require('@google-cloud/storage');
const puppeteer = require('puppeteer');

const dbClient = require('db')();
const Sessions = require('db/sessions/model')(dbClient);

const { BUCKET_NAME } = require('defs');

const options = {
  margin: {
    top: '0.5cm',
    bottom: '0.5cm',
    left: '0.5cm',
    right: '0.5cm',
  },
  printBackground: true,
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

  async createPdf(html) {
    const storageFile = this.storage.bucket(BUCKET_NAME).file(this.filename);

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html);
    await page.emulateMedia('screen');

    const buffer = await page.pdf(options);
    return storageFile.save(buffer, { gzip: true });
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
