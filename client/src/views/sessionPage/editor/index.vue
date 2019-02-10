<template>
  <div
    class="editor"
    @scroll="onScrollEditor"
  >
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

import {
  codeBlockIndentHandler,
  initEditor,
  onExtendBlur,
  onExtendHandler,
  onLargerFontHandler,
  onResizeCollapse,
  onSmallerFontHandler,
  selectionUpdate,
  setupQuill,
  textUpdate,
} from './utils';
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
  props: {
    name: String,
  },
  data() {
    return {
      content: '',
      editor: null,
      sizes: FONT_SIZES,
      updateTimeout: null,
    };
  },
  mounted() {
    this.editor = new Quill(this.$refs.editor, {
      modules: {
        cursors: { autoRegisterListener: false },
        keyboard: {
          bindings: { 'indent code-block': codeBlockIndentHandler(true) },
        },
        toolbar: {
          container: this.$refs.toolbar,
          handlers: {
            smallerFont: onSmallerFontHandler.bind(this),
            largerFont: onLargerFontHandler.bind(this),
            extend: onExtendHandler.bind(this),
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
  },
  beforeDestroy() {
    window.removeEventListener('click', this.onCheckBlur);
    window.removeEventListener('click', this.onExtendBlur);
    window.removeEventListener('resize', this.onResizeCollapse);
  },
  methods: {
    initEditor,
    onCheckBlur() {
      if (!this.editor.hasFocus()) {
        this.$socket.emit('editor:onEditorSelectionRemove');
      }
    },
    onClickCollapse(e) {
      e.stopPropagation();
    },
    onExtendBlur,
    onResizeCollapse,
    onScrollEditor() {
      this.editor.getModule('cursors').update();
    },
    selectionUpdate,
    textUpdate,
  },
  sockets: {
    'socket:onEnter': function({ content }) {
      this.editor.root.innerHTML = content;
      this.editor.enable();

      setTimeout(() => {
        this.editor.history.clear();
        this.$socket.emit('editor:onEnter');
      }, 0);
    },
    'editor:onEditorSelectionUpdate': function({ data, name, userId }) {
      const range = new Range(data.index, data.length);
      this.editor.getModule('cursors').setCursor(userId, range, name, 'red');
    },
    'editor:onEditorSelectionRemove': function({ userId }) {
      this.editor.getModule('cursors').removeCursor(userId);
    },
    'editor:onEditorTextUpdate': function({ data, userId }) {
      this.editor.updateContents(data, userId);
      this.editor.getModule('cursors').update();
    },
  },
};
</script>

<style>
/* should NOT be scoped */
.editor {
  border: 1px solid #ccc;
  border-radius: 5px;
  height: 100%;
  min-height: 500px;
  overflow-y: auto;
  width: 100%;
}

.ql-toolbar {
  height: 40px;
}

.ql-container {
  min-height: 458px;
  max-height: calc(100% - 40px);
}

.hide-toolbar {
  display: none !important;
}

.open {
  padding-right: 28px;
}

.open,
.open > div {
  display: inline;
}

.collapse {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.2) 0 2px 8px;
  opacity: 0;
  padding: 3px 5px;
  pointer-events: none;
  position: absolute;
  transition: opacity var(--transition-duration) var(--transition-curve);
  transform: translateY(2px);
  z-index: 1;
}

.collapse.show {
  opacity: 1;
  pointer-events: auto;
}

.collapse > div > span {
  margin-right: 10px !important;
}

.collapse > div > span:last-child {
  margin-right: 0 !important;
}

.extend {
  margin-right: 0 !important;
  right: 8px;
  position: absolute;
  top: 8px;
}

.extend::before {
  color: #ccc;
  content: '|';
  font-size: 12px;
  left: -2px;
  line-height: 26px;
  opacity: 0.75;
  position: absolute;
  transform: translateX(-100%);
  top: 0;
}

.fake-toolbar {
  opacity: 0;
  pointer-events: none;
  padding-right: 36px;
  position: absolute;
  top: 8px;
  user-select: none;
}

.ql-snow.ql-toolbar,
.ql-container.ql-snow {
  border: none;
  font-size: 16px;
}

.ql-snow .ql-picker {
  font-size: 14px;
}

.ql-editor strong {
  font-weight: 500;
}

.ql-editor * {
  line-height: 1.5em;
}

.ql-cursors {
  position: absolute;
}

.ql-picker,
.ql-formats > button {
  border-radius: 3px;
}

.ql-picker {
  height: 32px;
}

.ql-picker-label {
  padding-top: 4px;
  padding-bottom: 4px;
}

.ql-color-picker svg,
.ql-icon-picker svg {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.ql-color-picker.ql-background svg {
  top: calc(50% - 1px);
}

.ql-picker:active,
.ql-formats > button:active,
.ql-picker-item:active,
.ql-picker:focus,
.ql-formats > button:focus,
.ql-picker-item:focus,
button.ql-active,
button.active,
.ql-expanded {
  background-color: var(--main-font-color-light) !important;
}

.ql-picker:hover,
.ql-formats > button:hover,
.ql-picker-item:hover {
  background-color: var(--gray-bg-color-3);
}

.ql-snow.ql-toolbar button:focus,
.ql-snow .ql-toolbar button:focus,
.ql-snow.ql-toolbar button.ql-active,
.ql-snow .ql-toolbar button.ql-active,
.ql-snow.ql-toolbar .ql-picker-label.ql-active,
.ql-snow .ql-toolbar .ql-picker-label.ql-active,
.ql-snow.ql-toolbar button.active,
.ql-snow .ql-toolbar button.active,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected,
.ql-picker.ql-expanded .ql-picker-label::before {
  color: var(--main-font-color) !important;
}

.ql-snow.ql-toolbar button:hover,
.ql-snow .ql-toolbar button:hover,
.ql-snow.ql-toolbar .ql-picker-label:hover,
.ql-snow .ql-toolbar .ql-picker-label:hover,
.ql-snow.ql-toolbar .ql-picker-item:hover,
.ql-snow .ql-toolbar .ql-picker-item:hover {
  color: var(--black-font-color);
}

.ql-snow.ql-toolbar button:focus .ql-stroke,
.ql-snow .ql-toolbar button:focus .ql-stroke,
.ql-snow.ql-toolbar button.ql-active .ql-stroke,
.ql-snow .ql-toolbar button.ql-active .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
.ql-snow.ql-toolbar button:focus .ql-stroke-miter,
.ql-snow .ql-toolbar button:focus .ql-stroke-miter,
.ql-snow.ql-toolbar button.ql-active .ql-stroke-miter,
.ql-snow .ql-toolbar button.ql-active .ql-stroke-miter,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter,
.ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-stroke {
  stroke: var(--main-font-color) !important;
}

.ql-snow.ql-toolbar button:hover .ql-stroke,
.ql-snow .ql-toolbar button:hover .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke,
.ql-snow.ql-toolbar button:hover .ql-stroke-miter,
.ql-snow .ql-toolbar button:hover .ql-stroke-miter,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter {
  stroke: var(--black-font-color);
}

.ql-snow.ql-toolbar button:focus .ql-fill,
.ql-snow .ql-toolbar button:focus .ql-fill,
.ql-snow.ql-toolbar button.ql-active .ql-fill,
.ql-snow .ql-toolbar button.ql-active .ql-fill,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill,
.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill,
.ql-snow.ql-toolbar button:focus .ql-stroke.ql-fill,
.ql-snow .ql-toolbar button:focus .ql-stroke.ql-fill,
.ql-snow.ql-toolbar button.ql-active .ql-stroke.ql-fill,
.ql-snow .ql-toolbar button.ql-active .ql-stroke.ql-fill,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill,
.ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-fill {
  fill: var(--main-font-color) !important;
}

.ql-snow.ql-toolbar button:hover .ql-fill,
.ql-snow .ql-toolbar button:hover .ql-fill,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill,
.ql-snow.ql-toolbar button:hover .ql-stroke.ql-fill,
.ql-snow .ql-toolbar button:hover .ql-stroke.ql-fill,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill {
  fill: var(--black-font-color);
}

.ql-toolbar.ql-snow .ql-picker-options {
  border-radius: 5px;
}

.ql-snow .ql-picker-options {
  padding-left: 0;
  padding-right: 0;
}

.ql-picker-item {
  padding-left: 8px;
  padding-right: 8px;
}

.ql-picker-label {
  border: none !important;
}

.ql-snow .ql-picker-label::before {
  line-height: 26px;
  position: relative;
  top: -4px;
}

.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before,
.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  font-family: 'Rubik', sans-serif !important;
  font-weight: 400 !important;
}

.ql-font-rubik,
.ql-picker-item[data-value='rubik']::before,
.ql-picker-label[data-value='rubik']::before {
  content: 'Rubik' !important;
  font-family: 'Rubik', sans-serif !important;
  font-weight: 400;
}

code {
  display: inline-block;
  z-index: -1;
}

code,
code *,
pre,
pre * {
  font-family: monospace !important;
}

code strong,
pre strong {
  font-weight: 800 !important;
}

.ql-cursor-selection-block {
  pointer-events: none;
}

.ql-cursor-name {
  user-select: none;
}

.ql-snow .ql-picker-options {
  border: 1px solid #ccc !important;
  display: block;
  margin-top: -1px;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-duration) var(--transition-curve);
  top: 100%;
  z-index: 1;
}

.ql-snow .ql-picker.ql-expanded .ql-picker-options {
  opacity: 1;
  pointer-events: auto;
}

.ql-editor ol,
.ql-editor ul {
  padding-left: 0;
}

@media (max-width: 700px) {
  .editor {
    max-height: 800px;
  }
}
</style>
