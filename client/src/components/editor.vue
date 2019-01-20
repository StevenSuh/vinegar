<template>
  <div
    ref="editor"
    v-html="value"
    :id="hello"
  ></div>
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
        hello: 'world',
      };
    },
    methods: {
      onCheckBlur: function() {
        if (!this.editor.hasFocus()) {
          this.$socket.emit('onEditorSelectionRemove', {
            room: this.$route.params.roomname,
            userId: this.userId,
          });
          this.hello = 'bye';
        }
      },
      selectionUpdate(range, oldRange, source) {
        if (source === 'user' && range) {
          this.$socket.emit('onEditorSelectionUpdate', {
            data: range,
            name: this.name,
            room: this.$route.params.roomname,
            userId: this.userId,
          });
        }
      },
      textUpdate(delta, oldDelta, source) {
        if (source === 'user') {
          this.$socket.emit('onEditorTextUpdate', {
            data: delta,
            room: this.$route.params.roomname,
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
            ['bold', 'italic', 'underline', 'strike', 'code'],        // toggled buttons
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

      // add checkBlur event to window
      window.addEventListener('click', this.onCheckBlur);
    },
    sockets: {
      connect: function () {
        this.$socket.emit('joinRoom', {
          room: this.$route.params.roomname,
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
      onEditorSelectionRemove: function({ userId }) {
        this.editor.getModule('cursors').removeCursor(userId);
      },
      onEditorTextUpdate: function(data) {
        this.editor.updateContents(data);
      },
    },
    beforeDestroy() {
      window.removeEventListener('blur', this.onCheckBlur);
    },
  }
</script>