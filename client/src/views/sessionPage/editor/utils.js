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

export function onResizeCollapse() {
  /*
    fakeToolbar is hidden on DOM. However, it maintains DOM properties such as `offsetLeft`.
    Therefore, this is taking advantage of its DOM position properties to make decision on
    which items to collapse for the editor's toolbar
  */
  const fakeToolbar = this.$refs.fakeToolbar.children[0].children;
  let prevOffset = fakeToolbar[0].offsetLeft;

  let i = 1;
  for (; i < fakeToolbar.length; i += 1) {
    if (fakeToolbar[i].offsetLeft < prevOffset) {
      break;
    }
    prevOffset = fakeToolbar[i].offsetLeft;
  }

  const open = this.$refs.open.children[0].children;
  for (let j = 1; j < i; j += 1) {
    open[j].classList.remove('hide-toolbar');
  }
  for (let j = i; j < open.length; j += 1) {
    open[j].classList.add('hide-toolbar');
  }

  const collapse = this.$refs.collapse.children[0].children;
  for (let j = 0; j < i; j += 1) {
    collapse[j].classList.add('hide-toolbar');
  }
  for (let j = i; j < collapse.length; j += 1) {
    collapse[j].classList.remove('hide-toolbar');
  }

  const { extend } = this.$refs;
  const collapseEl = this.$refs.collapse;

  if (i < collapse.length) {
    const parent = this.$refs.toolbar;
    const distance = (parent.offsetWidth - extend.offsetWidth) - (extend.offsetLeft - parent.offsetLeft);

    collapseEl.style.right = `${distance}px`;
    extend.classList.remove('hide-toolbar');
  } else {
    collapseEl.removeAttribute('style');
    extend.classList.add('hide-toolbar');
  }
}
