<template>
  <div class="download">
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
      <p v-if="!isDownloading">
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
import Loader from '@/components/loader';
import Tooltip from '@/components/tooltip';

import DownloadIcon from '@/assets/download.png';

export default {
  components: {
    Loader,
    Tooltip,
  },
  data() {
    return {
      DownloadIcon,
      isDownloading: false,
    };
  },
  methods: {
    onStartDownload() {
      if (!this.isDownloading) {
        this.isDownloading = true;

        setTimeout(() => {
          this.isDownloading = false;
        }, 1000);
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
