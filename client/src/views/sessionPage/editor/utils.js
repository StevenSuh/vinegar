import Quill from 'quill';
import QuillCursors from 'quill-cursors';

import { CONTENT_UPDATE_DUR, FONT_SIZES } from '@/defs';

import PlainClipboard from './PlainClipboard';

const Delta = Quill.import('delta');

export function setupQuill() {
  Quill.register('modules/clipboard', PlainClipboard, true);

  const Font = Quill.import('formats/font');
  Font.whitelist = ['rubik'];

  Quill.register(Font, true);
  Quill.register('modules/cursors', QuillCursors);

  const Block = Quill.import('blots/block');
  Block.tagName = 'DIV';
  Quill.register(Block, true);

  const Size = Quill.import('attributors/style/size');
  Size.whitelist = FONT_SIZES;
  Quill.register(Size, true);
}

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

export function initEditor() {
  this.editor.format('font', 'rubik');
  this.editor.format('size', '16px');

  this.editor.on('editor-change', this.selectionUpdate);
  this.editor.on('text-change', this.textUpdate);

  document.getElementsByClassName('ql-extend')[0].innerHTML = '...';

  this.editor.enable(false);
  setTimeout(() => this.onResizeCollapse(), 0);
}

export function onExtendBlur(e) {
  const button = this.$refs.extend.children[0];
  const { collapse } = this.$refs;

  if (e.target !== button && e.target !== collapse) {
    const isActive =
      button.classList.contains('active') &&
      collapse.classList.contains('show');

    if (isActive) {
      button.classList.remove('active');
      collapse.classList.remove('show');
    }
  }
}

export function selectionUpdate(type, range, _oldRange, source) {
  if (type === 'selection-change') {
    if (source !== Quill.sources.API && range) {
      // this setTimeout is necessary because
      // textUpdate is occurring at the same time
      // causing cursor to update inaccurately
      setTimeout(() => {
        this.$socket.emit('editor:onEditorSelectionUpdate', { data: range });
      }, 0);
    }
  }
}

export function textUpdate(delta, _oldDelta, source) {
  if (source === Quill.sources.USER) {
    this.$socket.emit('editor:onEditorTextUpdate', {
      data: delta,
      content: this.editor.root.innerHTML,
    });

    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => {
      this.$socket.emit('editor:onEditorContentUpdate', this.editor.root.innerHTML);
    }, CONTENT_UPDATE_DUR);
  }
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
