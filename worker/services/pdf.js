const { Storage } = require('@google-cloud/storage');
const puppeteer = require('puppeteer');

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
  constructor() {
    this.filename = `${Date.now()}.pdf`;
    this.url = null;
    this.stream = null;

    this.storage = new Storage();
  }

  async createPdf(html) {
    const storageFile = this.storage.bucket(BUCKET_NAME).file(this.filename);

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const buffer = await page.pdf(options);
    await storageFile.save(buffer, { gzip: true });
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
