<template>
  <div class="wrapper">
    <p class="msg">
      {{ 'Session has ' }}
      <span class="bold">
        {{ 'ended.' }}
      </span>
    </p>
    <download-button />
  </div>
</template>

<script>
import DownloadButton from './downloadButton';

export default {
  components: {
    DownloadButton,
  },
};
</script>

<style scoped>
.wrapper {
  padding-top: 30px;
  text-align: center;
  width: 100%;
}

.msg {
  font-size: 18px;
  margin-bottom: 10px;
}

.bold {
  font-weight: 500;
}
</style>
