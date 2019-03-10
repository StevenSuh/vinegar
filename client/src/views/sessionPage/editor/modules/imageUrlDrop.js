import Quill from 'quill';

const Delta = Quill.import('delta');

export default class ImageUrlDrop {
  constructor(quill) {
    this.quill = quill;
    this.handleDrop = this.handleDrop.bind(this);
    this.insertObject = this.insertObject.bind(this);
    this.quill.root.addEventListener('drop', this.handleDrop, false);
  }

  handleDrop(event) {
    event.preventDefault();
    const text = event.dataTransfer.getData("text") || event.dataTransfer.getData("url");

    if (text) {
			if (document.caretRangeFromPoint) {
				const selection = document.getSelection();
				const range = document.caretRangeFromPoint(event.clientX, event.clientY);
				if (selection && range) {
					selection.setBaseAndExtent(range.startContainer, range.startOffset, range.startContainer, range.startOffset);
				}
			}

      const index = (this.quill.getSelection() || {}).index || this.quill.getLength();
      this.insertObject(text, index);
    }
  }

  insertObject(text, index) {
    const imgTypes = ['.png', '.gif', '.jpeg', '.bmp', '.ico', '.svg'];
    for (let i = 0; i < imgTypes.length; i += 1) {
      const type = imgTypes[i];
      if (text.endsWith(type)) {
        this.quill.insertEmbed(index, "image", text, 'user');

        const image = document.querySelectorAll(`[src="${text}"]`);
        for (let j = 0; j < image.length; j += 1) {
          const downloadedImg = image[j];
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          canvas.width = downloadedImg.width;
          canvas.height = downloadedImg.height;
          context.drawImage(downloadedImg, 0, 0);

          try {
            const dataUrl = canvas.toDataURL();
            downloadedImg.src = dataUrl;
          } catch (_) {
            downloadedImg.src = 'invalid';
            return;
          }
        }

        return;
      }
    }

    if (text.startsWith('http')) {
      return this.quill.insertText(index, text, { link: text });
    }
    return this.plainPaste(text);
  }

  plainPaste(text) {
    const range = this.quill.getSelection();

    const current = this.quill.getFormat();
    const leftSide = this.quill.getFormat(range.index - 1, range.index);
    const rightSide = this.quill.getFormat(range.index, range.index + 1);

    const attribute = {
      ...rightSide,
      ...leftSide,
      ...current,
    };

    Object.keys(attribute).forEach((key) => {
      if (current[key]) {
        attribute[key] = current[key];
      }
      if (
        (leftSide[key] && rightSide[key]) &&
        (leftSide[key] === rightSide[key])
      ) {
        attribute[key] = leftSide[key];
      }
    });

    const delta = new Delta()
      .retain(range.index)
      .delete(range.length)
      .insert(text, attribute);
    const index = text.length + range.index;
    const length = 0;

    this.quill.updateContents(delta, Quill.sources.USER);
    this.quill.setSelection(index, length, Quill.sources.USER);
    this.quill.scrollIntoView();
  }
}
