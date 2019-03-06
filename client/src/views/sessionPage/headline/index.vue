<template>
  <div class="headline-wrapper">
    <p>Headline</p>
    <Help
      class="help-button"
      :socket="socket"
    />
  </div>
</template>

<script>
import Help from './helpModal';

export default {
  components: {
    Help,
  },
  props: {
    socket: [Object, WebSocket],
  },
};
</script>

<style scoped>
.headline-wrapper {
  align-items: center;
  display: flex;
  justify-content: flex-end;
}

.help-button {
  margin-left: 50px;
}
</style>
