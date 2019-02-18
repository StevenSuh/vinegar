<template>
  <div class="editor">
    <div ref="toolbar">
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
    <div ref="editor" />
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

import { FONT_SIZES } from '@/defs';

import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill-cursors/dist/quill-cursors.css';

// setup editor
setupQuill();

export default {
  components: {
    ToolbarConfig,
  },
  mixins: [socketMixin],
  props: {
    name: String,
    socket: WebSocket,
  },
  data() {
    return {
      active: false,
      content: '',
      editor: null,
      prevEnter: false,
      sizes: FONT_SIZES,
      updateTimeout: null,
    };
  },
  mounted() {
    this.editor = new Quill(this.$refs.editor, {
      bounds: this.$refs.editor,
      modules: {
        cursors: { autoRegisterListener: false },
        keyboard: {
          bindings: { 'indent code-block': codeBlockIndentHandler(true) },
        },
        imageResize: {
          modules: ['Resize', 'DisplaySize'],
        },
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
    this.editor.root.addEventListener('scroll', this.onScrollEditor);
  },
  beforeDestroy() {
    window.removeEventListener('click', this.onCheckBlur);
    window.removeEventListener('click', this.onExtendBlur);
    window.removeEventListener('resize', this.onResizeCollapse);
    this.editor.root.removeEventListener('scroll', this.onScrollEditor);
  },
  methods: {
    checkForEnter,
    initEditor,
    onCheckBlur() {
      if (this.active && !this.editor.hasFocus()) {
        this.socket.sendEvent('editor:onEditorSelectionRemove');
      }
    },
    onClickCollapse(e) {
      e.stopPropagation();
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
      /* eslint-disable no-empty */
      try {
        this.editor.getModule('cursors').update();
      } catch (_) {}
      /* eslint-enable no-empty */
    },
    selectionUpdate,
    textUpdate,
  },
  sockets: {
    'socket:onEnter': function({ content }) {
      this.editor.root.innerHTML = content;
      this.editor.enable();

      setTimeout(() => {
        this.active = true;
        this.editor.history.clear();
        this.socket.sendEvent('editor:onEnter');
      }, 0);
    },
    'socket:onDuplicate': function() {
      this.editor.enable(false);
      this.editor.root.innerHTML = '';
    },
    'editor:onEditorSelectionUpdate': function({ color, data, name, userId }) {
      const range = new Range(data.index, data.length);
      /* eslint-disable no-empty */
      try {
        this.editor.getModule('cursors').setCursor(userId, range, name, color);
      } catch (_) {}
      /* eslint-enable no-empty */
    },
    'editor:onEditorSelectionRemove': function({ userId }) {
      /* eslint-disable no-empty */
      try {
        this.editor.getModule('cursors').removeCursor(userId);
      } catch (_) {}
      /* eslint-enable no-empty */
    },
    'editor:onEditorTextUpdate': function({ data, userId }) {
      this.editor.updateContents(data, userId);
      /* eslint-disable no-empty */
      try {
        this.editor.getModule('cursors').update();
      } catch (_) {}
      /* eslint-enable no-empty */
    },
  },
};
</script>

<style src="./style.css">
/* should NOT be scoped */
</style>
