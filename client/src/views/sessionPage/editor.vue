<template>
  <div>
    <div ref="toolbar">
      <div class="open" ref="open">
        <ToolbarConfig />
      </div>
      <span class="ql-formats hide-toolbar" ref="extend">
        <button class="ql-extend" v-on:blur="onExtendBlur" />
      </span>
      <div class="collapse" ref="collapse" v-on:click="onClickCollapse">
        <ToolbarConfig />
      </div>
      <div class="fake-toolbar" ref="fakeToolbar">
        <ToolbarConfig />
      </div>
    </div>
    <div ref="editor" />
  </div>
</template>

<script>
import Quill from 'quill';
import { Range } from 'quill/core/selection';
import QuillCursors from 'quill-cursors';
import ToolbarConfig from '@/views/sessionPage/toolbarConfig';

import RedoIcon from '!raw-loader!quill/assets/icons/redo.svg';
import UndoIcon from '!raw-loader!quill/assets/icons/undo.svg';

import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';

import 'quill-cursors/dist/quill-cursors.css';

import { codeBlockIndentHandler, onResizeCollapse } from './utils';
import PlainClipboard from './PlainClipboard';

// setup editor
Quill.register('modules/clipboard', PlainClipboard, true);

const Font = Quill.import('formats/font');
Font.whitelist = ['rubik'];

Quill.register(Font, true);
Quill.register('modules/cursors', QuillCursors);

const Block = Quill.import('blots/block');
Block.tagName = 'DIV';
Quill.register(Block, true);

export default {
  components: {
    ToolbarConfig,
  },
  props: {
    name: {
      type: String,
      default: 'Name',
    },
    content: {
      type: String,
      default: 'Hello world!',
    },
  },
  data() {
    return {
      editor: null,
      webSocket: null,
    };
  },
  mounted() {
    this.editor = new Quill(this.$refs.editor, {
      modules: {
        cursors: { autoRegisterListener: false },
        keyboard: { bindings: { 'indent code-block': codeBlockIndentHandler(true) } },
        toolbar: {
          container: this.$refs.toolbar,
          handlers: {
            extend: () => {
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
            },
            undo: () => this.editor.history.undo(),
            redo: () => this.editor.history.redo(),
          },
        },
      },
      theme: 'snow',
    });

    this.editor.root.innerHTML = this.content;
    this.editor.format('font', 'rubik');
    this.editor.history.clear();

    this.editor.on('editor-change', this.selectionUpdate);
    this.editor.on('text-change', this.textUpdate);

    document.getElementsByClassName('ql-extend')[0].innerHTML = '...';
    document.getElementsByClassName('ql-undo')[0].innerHTML = UndoIcon;
    document.getElementsByClassName('ql-undo')[1].innerHTML = UndoIcon;
    document.getElementsByClassName('ql-redo')[0].innerHTML = RedoIcon;
    document.getElementsByClassName('ql-redo')[1].innerHTML = RedoIcon;

    // add checkBlur event to window
    window.addEventListener('click', this.onCheckBlur);
    window.addEventListener('click', this.onExtendBlur);
    window.addEventListener('resize', this.onResizeCollapse);

    setTimeout(() => this.onResizeCollapse(), 0);
  },
  beforeDestroy() {
    window.removeEventListener('click', this.onCheckBlur);
    window.removeEventListener('click', this.onExtendBlur);
    window.removeEventListener('resize', this.onResizeCollapse);
  },
  methods: {
    onCheckBlur() {
      if (!this.editor.hasFocus()) {
        this.$socket.emit('onEditorSelectionRemove');
      }
    },
    onClickCollapse(e) {
      e.stopPropagation();
    },
    onExtendBlur(e) {
      const button = this.$refs.extend.children[0];
      const { collapse } = this.$refs;

      if (e.target !== button && e.target !== collapse) {
        const isActive = button.classList.contains('active') && collapse.classList.contains('show');

        if (isActive) {
          button.classList.remove('active');
          collapse.classList.remove('show');
        }
      }
    },
    onResizeCollapse,
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
  sockets: {
    onEditorSelectionUpdate({ data, name, userId }) {
      const range = new Range(data.index, data.length);
      this.editor.getModule('cursors').setCursor(userId, range, name, 'red');
    },
    onEditorSelectionRemove({ userId }) {
      this.editor.getModule('cursors').removeCursor(userId);
    },
    onEditorTextUpdate({ data, userId }) {
      this.editor.updateContents(data, userId);
    },
  },
};
</script>

<style>
/* should NOT be scoped */
.hide-toolbar {
  display: none !important;
}

.open,
.open > div {
  display: inline;
}

.collapse {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: rgba(0,0,0,0.2) 0 2px 8px;
  opacity: 0;
  padding: 3px 5px;
  pointer-events: none;
  position: absolute;
  transition: opacity var(--transition-duration) var(--transition-curve);
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

.fake-toolbar {
  opacity: 0;
  pointer-events: none;
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
</style>
