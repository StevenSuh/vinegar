<template>
  <div>
    <div ref="toolbar">
      <span class="ql-formats">
        <button class="ql-bold" /> <button class="ql-italic" />
        <button class="ql-underline" /> <button class="ql-strike" />
        <button class="ql-code" />
      </span>
      <span class="ql-formats">
        <button class="ql-blockquote" /> <button class="ql-code-block" />
      </span>
      <span class="ql-formats">
        <button class="ql-header" value="1" />
        <button class="ql-header" value="2" />
      </span>
      <span class="ql-formats">
        <button class="ql-list" value="ordered" />
        <button class="ql-list" value="bullet" />
      </span>
      <span class="ql-formats">
        <button class="ql-script" value="sub" />
        <button class="ql-script" value="super" />
      </span>
      <span class="ql-formats">
        <button class="ql-indent" value="-1" />
        <button class="ql-indent" value="+1" />
      </span>
      <span class="ql-formats">
        <button class="ql-direction" value="rtl" />
      </span>
      <span class="ql-formats">
        <select class="ql-size">
          <option value="small" />
          <option selected="selected" />
          <option value="large" />
          <option value="huge" />
        </select>
      </span>
      <span class="ql-formats">
        <select class="ql-header">
          <option value="1" />
          <option value="2" />
          <option value="3" />
          <option value="4" />
          <option value="5" />
          <option value="6" />
          <option selected="selected" />
        </select>
      </span>
      <span class="ql-formats">
        <select class="ql-color" />
        <select class="ql-background" />
      </span>
      <span class="ql-formats">
        <button class="ql-align ql-active" value />
        <button class="ql-align" value="center" />
        <button class="ql-align" value="right" />
      </span>
      <span class="ql-formats"> <button class="ql-clean" /> </span>
      <span class="ql-formats">
        <button class="ql-undo" /> <button class="ql-redo" />
      </span>
    </div>
    <div ref="editor" v-html="value" />
  </div>
</template>

<script>
import Quill from 'quill';
import {Range} from 'quill/core/selection';
import QuillCursors from 'quill-cursors';

import RedoIcon from '!raw-loader!quill/assets/icons/redo.svg';
import UndoIcon from '!raw-loader!quill/assets/icons/undo.svg';

import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';

import 'quill-cursors/dist/quill-cursors.css';

import {codeBlockIndentHandler} from './utils';
import PlainClipboard from './PlainClipboard';

Quill.register('modules/clipboard', PlainClipboard, true);

const Font = Quill.import('formats/font');
Font.whitelist = ['rubik'];

Quill.register(Font, true);
Quill.register('modules/cursors', QuillCursors);

export default {
  props: {
    name: {
      type: String,
      default: 'Name',
    },
    value: {
      type: String,
      default: 'Hello world! ',
    },
  },
  data() {
    return {
      editor: null,
      webSocket: null,
    };
  },
  methods: {
    onCheckBlur: function() {
      if (!this.editor.hasFocus()) {
        this.$socket.emit('onEditorSelectionRemove');
      }
    },
    selectionUpdate(type, range, oldRange, source) {
      if (type === 'selection-change') {
        if (source !== Quill.sources.API && range) {
          // this setTimeout is necessary because
          // textUpdate is occurring at the same time
          // causing cursor to update inaccurately
          setTimeout(() => {
            this.$socket.emit('onEditorSelectionUpdate', {
              data: range,
              name: this.name,
            });
          }, 0);
        }
      }
    },
    textUpdate(delta, oldDelta, source) {
      if (source === Quill.sources.USER) {
        this.$socket.emit('onEditorTextUpdate', {
          data: delta,
        });
      }
    },
  },
  mounted() {
    this.editor = new Quill(this.$refs.editor, {
      modules: {
        cursors: {
          autoRegisterListener: false,
        },
        keyboard: {
          bindings: {
            'indent code-block': codeBlockIndentHandler(true),
          },
        },
        toolbar: {
          container: this.$refs.toolbar,
          handlers: {
            undo: () => {
              this.editor.history.undo();
            },
            redo: () => {
              this.editor.history.redo();
            },
          },
        },
      },
      theme: 'snow',
    });

    this.editor.format('font', 'rubik');

    this.editor.on('editor-change', this.selectionUpdate);
    this.editor.on('text-change', this.textUpdate);

    document.getElementsByClassName('ql-undo')[0].innerHTML = UndoIcon;
    document.getElementsByClassName('ql-redo')[0].innerHTML = RedoIcon;

    // add checkBlur event to window
    window.addEventListener('click', this.onCheckBlur);
  },
  sockets: {
    onEditorSelectionUpdate: function({data, name, userId}) {
      const range = new Range(data.index, data.length);
      this.editor.getModule('cursors').setCursor(userId, range, name, 'red');
    },
    onEditorSelectionRemove: function({userId}) {
      this.editor.getModule('cursors').removeCursor(userId);
    },
    onEditorTextUpdate: function({data, userId}) {
      this.editor.updateContents(data, userId);
    },
  },
  beforeDestroy() {
    window.removeEventListener('blur', this.onCheckBlur);
  },
};
</script>

<style>
/* should NOT be scoped */
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
</style>
