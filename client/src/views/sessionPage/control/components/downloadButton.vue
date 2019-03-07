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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import Loader from '@/components/loader';
import Tooltip from '@/components/tooltip';

import DownloadIcon from '@/assets/download.png';

import RubikLight from './Rubik-Light-light';
import RubikBold from './Rubik-Medium-bold';
import RubikNormal from './Rubik-Regular-normal';

// connecting html2canvas for using with jsPDF
window.html2canvas = html2canvas;

export default {
  components: {
    Loader,
    Tooltip,
  },
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

        const editor = document.getElementById('editor');
        const pageHeight =
          editor.clientWidth * 1.2941 > editor.scrollHeight
            ? editor.clientWidth * 1.2941
            : editor.scrollHeight;
        const pdf = new jsPDF('p', 'pt', [editor.clientWidth, pageHeight + 15]);

        // custom font
        pdf.addFileToVFS('Rubik-Regular.ttf', RubikNormal);
        pdf.addFileToVFS('Rubik-Medium.ttf', RubikBold);
        pdf.addFileToVFS('Rubik-Light.ttf', RubikLight);
        pdf.addFont('Rubik-Regular.ttf', 'rubik', 'normal');
        pdf.addFont('Rubik-Medium.ttf', 'rubik', 'bold');
        pdf.addFont('Rubik-Light.ttf', 'rubik', 'light');

        // html2canvas uses window.devicePixelRatio (which is 2), which is too large
        const { defaultPixelRatio } = window;
        window.devicePixelRatio = 1;
        pdf.html(editor, {
          callback: generatedPdf => {
            const { school, session } = this.$route.params;

            const a = document.createElement('a');
            a.href = generatedPdf.output('datauristring');
            a.download = `${school}-${session}.pdf`;
            a.target = '_blank';
            a.click();

            // reset window.devicePixelRatio to default;
            window.devicePixelRatio = defaultPixelRatio;
            this.isDownloading = false;
            if (!this.mouseover) {
              this.reset = true;
            } else {
              this.isLoading = false;
            }
          },
        });
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
