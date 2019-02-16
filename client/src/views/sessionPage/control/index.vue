<template>
  <div class="control">
    <div v-if="isInterval"></div>
    <Inactive
      v-else-if="status !== 'active'"
      :duration="duration"
      :is-owner="isOwner"
    />
    <Active
      v-else-if="status === 'active'"
      :end-time="endTime"
      :interval-name="intervalName"
      :is-owner="isOwner"
    />
  </div>
</template>

<script>
import Active from './active';
import Inactive from './inactive';

import ButtonComponent from '@/components/button';

export default {
  components: {
    Active,
    ButtonComponent,
    Inactive,
  },
  data() {
    return {
      duration: null,
      endTime: null,
      intervalName: null,
      intervalEndTime: null,
      isInterval: null,
      isOwner: null,
      status: null,
    };
  },
  sockets: {
    'socket:onEnter': function({ isOwner }) {
      this.isOwner = isOwner;
    },
  },
};
</script>

<style scoped>
.control {
  display: flex;
}
</style>
