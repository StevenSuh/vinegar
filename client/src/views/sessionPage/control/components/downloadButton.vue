<template>
  <div
    class="download"
    @mouseenter="onResetDownload"
    @mouseleave="onMouseLeave"
  >
    <img
      class="hover"
      :src="DownloadIcon"
      alt="download icon"
    />
    <Tooltip
      position="top"
      :force-show="isDownloading"
      :on-click="onStartDownload"
    >
      <p v-if="!isLoading">
        Download Current Doc
      </p>
      <Loader
        v-else
        color="white"
        size="x-small"
      />
    </Tooltip>
  </div>
</template>

<script>
import { socketMixin } from '@/services/socket';

import Loader from '@/components/loader';
import Tooltip from '@/components/tooltip';

import DownloadIcon from '@/assets/download.png';

export default {
  components: {
    Loader,
    Tooltip,
  },
  mixins: [socketMixin],
  props: {
    socket: [Object, WebSocket],
  },
  data() {
    return {
      DownloadIcon,
      isDownloading: false,
      isLoading: false,
      mouseover: false,
    };
  },
  methods: {
    onStartDownload() {
      if (!this.isDownloading) {
        this.isDownloading = true;
        this.isLoading = true;

        this.socket.sendEvent('control:onDownload');
      }
    },
    onResetDownload() {
      this.mouseover = true;

      if (this.reset) {
        this.isLoading = false;
        this.reset = false;
      }
    },
    onMouseLeave() {
      this.mouseover = false;
    },
  },
  sockets: {
    'control:onDownload': function({ url }) {
      this.isDownloading = false;

      const { school, session } = this.$route.params;
      const a = document.createElement('a');
      a.href = url;
      a.download = `${school}-${session}.pdf`;
      a.target = '_blank';
      a.click();

      if (!this.mouseover) {
        this.reset = true;
      } else {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.download {
  cursor: pointer;
  display: inline-block;
  height: 40px;
  width: 40px;
}

.download > img {
  height: 100%;
  object-fit: fit;
  width: 100%;
}
</style>
