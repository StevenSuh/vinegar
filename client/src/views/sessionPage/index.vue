<template>
  <SessionPageWrapper />
</template>

<script>
import Vue from 'vue';
import VueSocketIO from 'vue-socket.io';

import SessionPageWrapper from './wrapper';

export default {
  components: {
    SessionPageWrapper,
  },
  beforeCreate() {
    Vue.use(new VueSocketIO({ connection: '/' }));
  },
}
</script>
