<template>
  <div class="editor">
    <div
      ref="toolbar"
      @click="onClickToolbar"
    >
      <div
        ref="open"
        class="open"
      >
        <ToolbarConfig />
      </div>
      <span
        ref="extend"
        class="ql-formats hide-toolbar extend"
      >
        <button
          class="ql-extend"
          @blur="onExtendBlur"
        />
      </span>
      <div
        ref="collapse"
        class="collapse"
        @click="onClickCollapse"
      >
        <ToolbarConfig />
      </div>
      <div
        ref="fakeToolbar"
        class="fake-toolbar"
      >
        <ToolbarConfig />
      </div>
    </div>
    <div
      id="editor"
      ref="editor"
      @click="onFocusEditor"
    />
  </div>
</template>

<script>
import Quill from 'quill';
import { Range } from 'quill/core/selection';

import { socketMixin } from '@/services/socket';

import {
  checkForEnter,
  initEditor,
  onExtendBlur,
  onResizeCollapse,
  selectionUpdate,
  setupQuill,
  textUpdate,
} from './utils';
import {
  codeBlockIndentHandler,
  onExtendHandler,
  onLargerFontHandler,
  onLinkHandler,
  onImageHandler,
  onSmallerFontHandler,
} from './modules/handlers';
import ToolbarConfig from './toolbarConfig';

import { FONT_SIZES, HEIGHT_SIZES } from '@/defs';

const Delta = Quill.import('delta');

// setup editor
setupQuill();

export default {
  components: {
    ToolbarConfig,
  },
  mixins: [socketMixin],
  props: {
    socket: [Object, WebSocket],
  },
  data() {
    return {
      active: false,
      content: '',
      cursor: null,
      editor: null,
      prevEnter: false,
      prevFocus: null,
      sizes: FONT_SIZES,
      height: HEIGHT_SIZES,
      updating: false,
      lastTextUpdateTime: 0,
    };
  },
  mounted() {
    this.editor = new Quill(this.$refs.editor, {
      bounds: this.$refs.editor,
      modules: {
        history: {
          userOnly: true,
        },
        cursors: true,
        keyboard: {
          bindings: { 'indent code-block': codeBlockIndentHandler(true) },
        },
        imageResize: {
          modules: ['Resize', 'DisplaySize'],
        },
        imageDrop: true,
        imageUrlDrop: true,
        magicUrl: true,
        toolbar: {
          container: this.$refs.toolbar,
          handlers: {
            smallerFont: onSmallerFontHandler.bind(this),
            largerFont: onLargerFontHandler.bind(this),
            extend: onExtendHandler.bind(this),
            link: onLinkHandler.bind(this),
            image: onImageHandler.bind(this),
            undo: () => this.editor.history.undo(),
            redo: () => this.editor.history.redo(),
          },
        },
      },
      theme: 'snow',
    });
    this.initEditor();
    window.addEventListener('click', this.onCheckBlur);
    window.addEventListener('click', this.onExtendBlur);
    window.addEventListener('resize', this.onResizeCollapse);
    window.addEventListener('offline', this.onSlowConnection);
    this.editor.root.addEventListener('scroll', this.onScrollEditor);
  },
  beforeDestroy() {
    window.removeEventListener('click', this.onCheckBlur);
    window.removeEventListener('click', this.onExtendBlur);
    window.removeEventListener('resize', this.onResizeCollapse);
    window.removeEventListener('offline', this.onSlowConnection);
    this.editor.root.removeEventListener('scroll', this.onScrollEditor);
  },
  methods: {
    onSlowConnection() {
      window.addEventListener('online', this.onFastConnection);
    },
    onFastConnection() {
      window.removeEventListener('online', this.onFastConnection);
      this.socket.sendEvent('editor:onEditorContentRequest');
    },
    checkForEnter,
    initEditor,
    onFocusEditor() {
      if (this.active && !this.prevFocus && this.editor.hasFocus()) {
        this.prevFocus = true;
      }
    },
    onCheckBlur() {
      if (this.active && this.prevFocus && !this.editor.hasFocus()) {
        this.prevFocus = false;
        this.socket.sendEvent('editor:onEditorSelectionRemove');
      }
    },
    onClickCollapse(e) {
      e.stopPropagation();
      this.editor.imageResize.repositionElements();
    },
    onClickToolbar() {
      this.editor.imageResize.repositionElements();
    },
    onExtendBlur,
    onResizeCollapse,
    onScrollEditor() {
      const items = this.$refs.editor.children;
      const lastItem = items[items.length - 1];
      if (lastItem.className === '') {
        lastItem.style.display = 'none';
      }

      this.editor.theme.tooltip.cancel();
      try {
        this.cursor.update();
      } catch (err) {
        console.warn(err); // eslint-disable-line no-console
      }
    },
    selectionUpdate,
    textUpdate,
  },
  sockets: {
    pong() {
      this.selectionUpdate('selection-change', this.editor.getSelection());
    },
    'socket:onEnter': function() {
      this.socket.sendEvent('editor:onEnter');
    },
    'socket:onDuplicate': function() {
      this.editor.enable(false);
      this.editor.root.innerHTML = '';
    },
    'people:onJoin': function() {
      this.selectionUpdate('selection-change', this.editor.getSelection());
    },
    'editor:onEnter': function({ content }) {
      this.active = true;
      this.editor.setContents(content, 'silent');
      this.editor.enable();
      this.editor.history.clear();
    },
    'editor:onEditorContentUpdate': function({ data = {} }) {
      const range = this.editor.getSelection() || { index: 0 };
      this.editor.updateContents(
        new Delta()
          .delete(this.editor.getLength())
          .retain(range.index)
          .concat(data),
        'silent',
      );
    },
    'editor:onEditorSelectionUpdate': function({ color, data, name, userId }) {
      if (data) {
        const range = new Range(data.index, data.length);
        try {
          this.cursor.setCursor(userId, range, name, color);
        } catch (err) {
          console.warn(err); // eslint-disable-line no-console
        }
      }
    },
    'editor:onEditorSelectionRemove': function({ userId }) {
      try {
        this.cursor.removeCursor(userId);
      } catch (err) {
        console.warn(err); // eslint-disable-line no-console
      }
    },
    'editor:onEditorTextUpdate': function({ data, userId }) {
      const diff = Date.now() - this.lastTextUpdateTime;

      // normalizer
      if (Math.abs(diff) < 100) {
        const retainOp = data.ops.find(op => op.retain !== undefined);
        const cursor = this.cursor.cursors[userId];

        if (retainOp && cursor && cursor.range.index < retainOp.retain) {
          retainOp.retain = cursor.range.index;
        }
      }
      this.editor.updateContents(data, 'silent');
      this.selectionUpdate('selection-change', this.editor.getSelection());
    },
  },
};
</script>

<style src="quill/dist/quill.core.css"></style>
<style src="quill/dist/quill.snow.css"></style>
<style src="quill-cursors/dist/quill-cursors.css"></style>
<style src="./style.css">
/* should NOT be scoped */
</style>
