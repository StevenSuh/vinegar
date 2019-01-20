<template>
  <div ref="editor" v-html="value"></div>
</template>

<script>
  import Quill from 'quill';
  import { Range } from 'quill/core/selection';
  import QuillCursors from 'quill-cursors';

  import 'quill/dist/quill.core.css'
  import 'quill/dist/quill.snow.css'

  import 'quill-cursors/dist/quill-cursors.css';

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
      selectionUpdate(range, oldRange, source) {
        if (source === 'user' && range) {
          this.$socket.emit('onEditorSelectionUpdate', {
            data: range,
            name: this.name,
            room: 'quill',
            userId: this.userId,
          });
        }
      },
      textUpdate(delta, oldDelta, source) {
        if (source === 'user') {
          this.$socket.emit('onEditorTextUpdate', {
            data: delta,
            room: 'quill',
          });
        }
        // this.$emit('input', this.editor.getText() ? this.editor.root.innerHTML : '');
      }
    },
    mounted() {
      this.editor = new Quill(this.$refs.editor, {
        modules: {
          cursors: true,
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],

            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
            [{ 'direction': 'rtl' }],                         // text direction

            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'font': [] }],
            [{ 'align': [] }],

            ['clean']                                         // remove formatting button
          ],
        },
        theme: 'snow',
      });

      this.editor.root.innerHTML = this.value;

      this.editor.on('selection-change', this.selectionUpdate);
      this.editor.on('text-change', this.textUpdate);
    },
    sockets: {
      connect: function () {
        this.$socket.emit('joinRoom', {
          room: 'quill',
        });
      },
      onEditorSelectionUpdate: function({ data, name, userId }) {
        const range = new Range(data.index, data.length);

        this.editor.getModule('cursors').setCursor(
          userId,
          range,
          name,
          'red',
        );
      },
      onEditorTextUpdate: function(data) {
        this.editor.updateContents(data);
      },
    },
  }
</script>