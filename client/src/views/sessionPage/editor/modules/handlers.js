import Quill from 'quill';

const Delta = Quill.import('delta');

export function onSmallerFontHandler() {
  const format = this.editor.getFormat();
  let index = this.sizes.indexOf(format.size || '16px');

  index = Math.max(index - 1, 0);
  this.editor.format('size', this.sizes[index]);
}

export function onLargerFontHandler() {
  const format = this.editor.getFormat();
  let index = this.sizes.indexOf(format.size || '16px');

  index = Math.min(index + 1, this.sizes.length - 1);
  this.editor.format('size', this.sizes[index]);
}

export function onExtendHandler() {
  const { extend } = this.$refs;
  const button = extend.children[0];
  const { collapse } = this.$refs;
  const isActive = button.classList.contains('active');

  if (!isActive) {
    const parent = this.$refs.toolbar;
    const distance = (parent.offsetWidth - extend.offsetWidth) - (extend.offsetLeft - parent.offsetLeft);

    this.$refs.collapse.style.right = `${distance}px`;
  }

  button.classList.toggle('active', !isActive);
  collapse.classList.toggle('show', !isActive);
}

export function onLinkHandler(value) {
  if (value) {
    const range = this.editor.getSelection();
    if (range == null || range.length === 0) return;

    const { tooltip } = this.editor.theme;
    tooltip.edit('link', '');
    tooltip.newLink(range);
  } else {
    this.editor.format('link', false);
  }
}

export function onImageHandler() {
  const range = this.editor.getSelection();
  const { tooltip } = this.editor.theme;
  tooltip.enableImage(range);
  tooltip.edit('link', '');

  const button = this.$refs.extend.children[0];
  const { collapse } = this.$refs;
  button.classList.remove('active');
  collapse.classList.remove('show');

  let imageEl;
  const imageEls = document.getElementsByClassName('ql-image');
  if (imageEls[1].parentElement.classList.contains('hide-toolbar')) {
    // eslint-disable-next-line prefer-destructuring
    imageEl = imageEls[0];
  } else {
    // eslint-disable-next-line prefer-destructuring
    imageEl = imageEls[1];
  }
  const containerBounds = this.$refs.editor.getBoundingClientRect();
  const imageBounds = imageEl.getBoundingClientRect();

  const left = imageBounds.left - containerBounds.left;
  const top = imageBounds.top - containerBounds.top - 20;
  tooltip.newShow({ height: imageEl.clientHeight, left, top });
}

export function codeBlockIndentHandler(indent) {
  return {
    key: 9,
    shiftKey: !indent,
    format: { 'code-block': true },
    handler(range) {
      const text = '  ';

      const delta = new Delta()
        .retain(range.index)
        .delete(range.length)
        .insert(text);
      const index = text.length + range.index;
      const length = 0;

      this.quill.updateContents(delta, Quill.sources.USER);
      this.quill.setSelection(index, length, Quill.sources.USER);
    },
  };
}
