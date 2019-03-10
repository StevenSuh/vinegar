/* eslint-disable class-methods-use-this */
import Quill from 'quill';

const Clipboard = Quill.import('modules/clipboard');
const Delta = Quill.import('delta');

class PlainClipboard extends Clipboard {
  onPaste(e) {
    e.preventDefault();
    if (e.clipboardData && e.clipboardData.items && e.clipboardData.items.length) {
			this.readFiles(e.clipboardData.items, dataUrl => {
        const index = (this.quill.getSelection() || {}).index || this.quill.getLength();
        this.quill.insertEmbed(index, 'image', dataUrl, 'user');
			});
		}
  }

  readFiles(files, callback) {
		// check each file for an image
		[].forEach.call(files, file => {
			if (!file.type.match(/^image\/(gif|jpe?g|a?png|svg|webp|bmp|vnd\.microsoft\.icon)/i)) {
				// file is not an image
				// Note that some file formats such as psd start with image/* but are not readable
				return;
			}
			// set up file reader
      const blob = file.getAsFile ? file.getAsFile() : file;
			const reader = new FileReader();
			reader.onload = (evt) => {
        if (!blob.webkitRelativePath) {
          callback(evt.target.result);
        }
			};
			// read the clipboard item or file
			if (blob instanceof Blob) {
				reader.readAsDataURL(blob);
			}
		});
	}

  onPasteText(text, range) {
    const imgTypes = ['.png', '.gif', '.jpeg', '.bmp', '.ico'];
    for (let i = 0; i < imgTypes.length; i += 1) {
      const type = imgTypes[i];
      if (text.endsWith(type)) {
        return this.quill.insertEmbed(range.index, "image", text);
      }
    }

    if (text.startsWith('http')) {
      return this.quill.insertText(range.index, text, { link: text });
    }

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

export default PlainClipboard;
