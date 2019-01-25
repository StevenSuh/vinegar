import Quill from 'quill'
const Clipboard = Quill.import('modules/clipboard')
const Delta = Quill.import('delta')

class PlainClipboard extends Clipboard {
  onPaste (e) {
    window.quill = this.quill;
    e.preventDefault();
    const range = this.quill.getSelection();
    const text = e.clipboardData.getData('text/plain');

    const current = this.quill.getFormat();
    const leftSide = this.quill.getFormat(range.index - 1, range.index);
    const rightSide = this.quill.getFormat(range.index, range.index + 1);

    const attribute = {
      ...rightSide,
      ...leftSide,
      ...current,
    };

    for (let key in attribute) {
      attribute[key] = current[key] || leftSide[key] || rightSide[key];
    }

    const delta = new Delta()
      .retain(range.index)
      .delete(range.length)
      .insert(text, attribute);
    const index = text.length + range.index;
    const length = 0

    this.quill.updateContents(delta, 'silent')
    this.quill.setSelection(index, length, 'silent')
    this.quill.scrollIntoView()
  }
}

export default PlainClipboard
