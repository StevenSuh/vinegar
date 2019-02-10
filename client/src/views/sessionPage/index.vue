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

    const { school } = this.$route.params;
    const { session } = this.$route.params;
    document.title = `Vinegar - ${school}/${session}`;
  },
};
</script>
