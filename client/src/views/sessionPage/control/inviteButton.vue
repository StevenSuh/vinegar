<template>
  <button-component
    type="primary"
    size="small"
    :prevent="true"
  >
    <div class="invite">
      <p>invite</p>
      <Tooltip
        position="top"
        :on-click="onCopyClipboard"
        :on-reset-click="onResetClipboard"
      >
        <p>{{ clipboardMsg }}</p>
      </Tooltip>
    </div>
  </button-component>
</template>

<script>
import ButtonComponent from '@/components/button';
import Tooltip from '@/components/tooltip';

export default {
  components: {
    ButtonComponent,
    Tooltip,
  },
  data() {
    return {
      clipboardMsg: 'Click to Copy Link',
    };
  },
  methods: {
    onCopyClipboard() {
      const dummy = document.createElement('input');
      dummy.value = window.location.href;

      document.body.appendChild(dummy);
      dummy.select();
      document.execCommand('copy');
      document.body.removeChild(dummy);

      this.clipboardMsg = 'Copied!';
    },
    onResetClipboard() {
      this.clipboardMsg = 'Click to Copy Link';
    },
  },
};
</script>

<style scoped></style>
