<template>
  <div class="result-wrapper">
    <div class="result-item" v-for="item in data" :key="item.sessionId">
      <h6>{{ item.schoolName }}</h6>
      <p>{{ item.sessionName }}</p>
      <p>{{ item.createdAt }}</p>
      <p>{{ item.duration }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style scoped>
.result-wrapper {
  background-color: var(--white-bg-color);
  border: 1px solid var(--gray-bg-color-2);
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  max-height: 340px;
  overflow-y: scroll;
  padding: 20px 0;
  top: -1px;
  width: 100%;
}

.result-item {
  cursor: pointer;
  padding: 15px 20px;
  transition: background-color var(--transition-duration)
    var(--transition-curve);
}

.result-item:hover {
  background-color: var(--gray-bg-color-hover);
}
</style>
