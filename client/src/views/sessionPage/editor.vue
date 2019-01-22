<template>
  <div ref="editor" v-html="value"></div>
</template>

<script>
import Quill from 'quill';
import { Range } from 'quill/core/selection';
import QuillCursors from 'quill-cursors';

import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';

import 'quill-cursors/dist/quill-cursors.css';

const Font = Quill.import('formats/font');
Font.whitelist = ['rubik', 'roboto'];

Quill.register(Font, true);
Quill.register('modules/cursors', QuillCursors);

export default {
  props: {
    name: {
      type: String,
      default: 'Name',
    },
    userId: {
      type: String,
      default: 'userId',
    },
    value: {
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
  methods: {
    onCheckBlur: function() {
      if (!this.editor.hasFocus()) {
        this.$socket.emit('onEditorSelectionRemove', {
          session: `${this.school}/${this.session}`,
          userId: this.userId,
        });
      }
    },
    selectionUpdate(range, oldRange, source) {
      if (source === 'user' && range) {
        this.$socket.emit('onEditorSelectionUpdate', {
          data: range,
          name: this.name,
          session: `${this.school}/${this.session}`,
          userId: this.userId,
        });
      }
    },
    textUpdate(delta, oldDelta, source) {
      if (source === 'user') {
        this.$socket.emit('onEditorTextUpdate', {
          data: delta,
          session: `${this.school}/${this.session}`,
        });
      }
      // this.$emit('input', this.editor.getText() ? this.editor.root.innerHTML : '');
    },
  },
  mounted() {
    this.editor = new Quill(this.$refs.editor, {
      modules: {
        cursors: true,
        toolbar: [
          ['bold', 'italic', 'underline', 'strike', 'code'], // toggled buttons
          ['blockquote', 'code-block'],

          [{ header: 1 }, { header: 2 }], // custom button values
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
          [{ indent: '-1'}, {indent: '+1' }], // outdent/indent
          [{ direction: 'rtl' }], // text direction

          [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: ['rubik', 'roboto'] }],

          [{ color: [] }, { background: [] }], // dropdown with defaults from theme
          [{ align: []} ],

          ['clean'], // remove formatting button
        ],
      },
      theme: 'snow',
    });

    this.editor.format('font', 'rubik');

    this.editor.on('selection-change', this.selectionUpdate);
    this.editor.on('text-change', this.textUpdate);

    // add checkBlur event to window
    window.addEventListener('click', this.onCheckBlur);
  },
  sockets: {
    connect: function() {
      this.$socket.emit('joinSession', {
        session: `${this.school}/${this.session}`,
      });
    },
    onEditorSelectionUpdate: function({data, name, userId}) {
      const range = new Range(data.index, data.length);

      this.editor.getModule('cursors').setCursor(userId, range, name, 'red');
    },
    onEditorSelectionRemove: function({userId}) {
      this.editor.getModule('cursors').removeCursor(userId);
    },
    onEditorTextUpdate: function(data) {
      this.editor.updateContents(data);
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
  font-size: 16px;
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

.ql-picker:hover,
.ql-formats > button:hover,
.ql-picker-item:hover {
  background-color: var(--main-font-color-light);
}

.ql-snow.ql-toolbar button:hover, .ql-snow .ql-toolbar button:hover, .ql-snow.ql-toolbar button:focus, .ql-snow .ql-toolbar button:focus, .ql-snow.ql-toolbar button.ql-active, .ql-snow .ql-toolbar button.ql-active, .ql-snow.ql-toolbar .ql-picker-label:hover, .ql-snow .ql-toolbar .ql-picker-label:hover, .ql-snow.ql-toolbar .ql-picker-label.ql-active, .ql-snow .ql-toolbar .ql-picker-label.ql-active, .ql-snow.ql-toolbar .ql-picker-item:hover, .ql-snow .ql-toolbar .ql-picker-item:hover, .ql-snow.ql-toolbar .ql-picker-item.ql-selected, .ql-snow .ql-toolbar .ql-picker-item.ql-selected, .ql-picker.ql-expanded .ql-picker-label::before {
  color: var(--main-font-color);
}

.ql-snow.ql-toolbar button:hover .ql-stroke, .ql-snow .ql-toolbar button:hover .ql-stroke, .ql-snow.ql-toolbar button:focus .ql-stroke, .ql-snow .ql-toolbar button:focus .ql-stroke, .ql-snow.ql-toolbar button.ql-active .ql-stroke, .ql-snow .ql-toolbar button.ql-active .ql-stroke, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke, .ql-snow.ql-toolbar button:hover .ql-stroke-miter, .ql-snow .ql-toolbar button:hover .ql-stroke-miter, .ql-snow.ql-toolbar button:focus .ql-stroke-miter, .ql-snow .ql-toolbar button:focus .ql-stroke-miter, .ql-snow.ql-toolbar button.ql-active .ql-stroke-miter, .ql-snow .ql-toolbar button.ql-active .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter, .ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-stroke {
  stroke: var(--main-font-color);
}

.ql-snow.ql-toolbar button:hover .ql-fill, .ql-snow .ql-toolbar button:hover .ql-fill, .ql-snow.ql-toolbar button:focus .ql-fill, .ql-snow .ql-toolbar button:focus .ql-fill, .ql-snow.ql-toolbar button.ql-active .ql-fill, .ql-snow .ql-toolbar button.ql-active .ql-fill, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill, .ql-snow.ql-toolbar button:hover .ql-stroke.ql-fill, .ql-snow .ql-toolbar button:hover .ql-stroke.ql-fill, .ql-snow.ql-toolbar button:focus .ql-stroke.ql-fill, .ql-snow .ql-toolbar button:focus .ql-stroke.ql-fill, .ql-snow.ql-toolbar button.ql-active .ql-stroke.ql-fill, .ql-snow .ql-toolbar button.ql-active .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill {
  fill: var(--main-font-color);
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

.ql-picker-label:focus,
.ql-picker-item:focus {
  outline: none;
}

.ql-snow .ql-picker-label::before {
  line-height: 26px;
}

.ql-font-rubik,
.ql-picker-item[data-value="rubik"]::before,
.ql-picker-label[data-value="rubik"]::before {
  content: 'Rubik' !important;
  font-family: 'Rubik', sans-serif !important;
  font-weight: 400;
}

.ql-font-roboto,
.ql-picker-item[data-value="roboto"]::before,
.ql-picker-label[data-value="roboto"]::before {
  content: 'Roboto' !important;
  font-family: 'Roboto', sans-serif !important;
  font-weight: 400;
}
</style>
