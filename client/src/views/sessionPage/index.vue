<template>
  <SessionPageWrapper
    v-if="show"
    :$socket="$socket"
  />
</template>

<script>
import { initSocket } from '@/services/socket';

import SessionPageWrapper from './wrapper';

export default {
  components: {
    SessionPageWrapper,
  },
  data() {
    return {
      $socket: null,
      show: false,
    };
  },
  beforeCreate() {
    const { school } = this.$route.params;
    const { session } = this.$route.params;
    document.title = `Vinegar - ${school}/${session}`;
  },
  mounted() {
    const url = `ws://${window.location.host}/ws${window.location.pathname}`;
    this.$socket = new WebSocket(url);
    initSocket(this.$socket);

    this.$socket.addEventListener('open', () => {
      this.show = true;
    });
  },
  beforeDestroy() {
    if (this.$socket) {
      this.$socket.close();
      this.$socket = null;
    }
  },
};
</script>
