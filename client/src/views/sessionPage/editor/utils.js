import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import ImageResize from 'quill-image-resize-module';
import { ImageDrop } from 'quill-image-drop-module';

import { CONTENT_UPDATE_DUR, FONT_SIZES } from '@/defs';

import PlainClipboard from './PlainClipboard';
import customizeTooltip from './modules/CustomTooltip';

export function setupQuill() {
  Quill.register('modules/clipboard', PlainClipboard, true);
  Quill.register('modules/cursors', QuillCursors);
  Quill.register('modules/imageResize', ImageResize);
  Quill.register('modules/imageDrop', ImageDrop);

  const Font = Quill.import('formats/font');
  Font.whitelist = ['rubik', 'arial', 'times', 'courier'];
  Quill.register(Font, true);

  const Block = Quill.import('blots/block');
  Block.tagName = 'DIV';
  Quill.register(Block, true);

  const Size = Quill.import('attributors/style/size');
  Size.whitelist = FONT_SIZES;
  Quill.register(Size, true);
}

export function initEditor() {
  this.editor.format('font', 'rubik');
  this.editor.format('size', '16px');

  this.editor.on('editor-change', this.selectionUpdate);
  this.editor.on('text-change', this.textUpdate);

  document.getElementsByClassName('ql-extend')[0].innerHTML = '...';

  customizeTooltip.call(this);

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
        this.socket.sendEvent('editor:onEditorSelectionUpdate', { data: range });
      }, 0);
    }
  }
}

export function checkForEnter(delta) {
  const ops = delta.ops || [];

  if (ops.length === 2) {
    const { insert } = ops[1];

    if (insert === '\n') {
      if (!this.prevEnter) {
        this.prevEnter = true;
        return;
      }
      const { index, length } = this.editor.getSelection();
      const format = this.editor.getFormat();

      if (format.blockquote || format['code-block']) {
        this.editor.removeFormat(index + 1, length, 'silent');
      }
    }
  }
  this.prevEnter = false;
};

export function textUpdate(delta, _oldDelta, source) {
  if (source === Quill.sources.USER) {
    this.checkForEnter(delta);

    this.socket.sendEvent('editor:onEditorTextUpdate', { data: delta });

    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => {
      this.socket.sendEvent('editor:onEditorContentUpdate', { content: this.editor.root.innerHTML });
    }, CONTENT_UPDATE_DUR);
  }
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
