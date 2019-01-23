<template>
  <Editor />
</template>

<script>
import Editor from '@/views/sessionPage/editor';
import Vue from 'vue';
import VueSocketIO from 'vue-socket.io';

export default {
  beforeCreate() {
    Vue.use(
      new VueSocketIO({
        connection: 'http://localhost:3000',
      })
    );
  },
  components: {
    Editor,
  },
};
</script>
