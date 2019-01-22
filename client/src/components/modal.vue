<template>
  <div>
    <div class="bg-overlay"></div>
    <div class="content"><slot></slot></div>
  </div>
</template>

<script>
export default {
  beforeCreate() {
    document.body.classList.add('overflow');
  },
  beforeDestroy() {
    document.body.classList.remove('overflow');
  },
};
</script>

<style>
.overflow {
  overflow: hidden;
}
</style>

<style scoped>
.bg-overlay {
  background-color: var(--black-font-color);
  opacity: 0.6;
  height: 100vh;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
}

.content {
  background-color: var(--white-bg-color);
  border-radius: 10px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
  left: 50%;
  padding: 40px;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
