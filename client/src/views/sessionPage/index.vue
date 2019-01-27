<template>
  <transition name="fade">
    <div v-if="show" class="session">
      <Editor :session="$route.params.session" :school="$route.params.school" />
      <chatRoom/>
    </div>
  </transition>
</template>

<script>
import Editor from '@/views/sessionPage/editor';
import Vue from 'vue';
import VueSocketIO from 'vue-socket.io';
import chatRoom from '@/views/sessionPage/chatRoom';

export default {
  beforeCreate() {
    Vue.use(
      new VueSocketIO({
        connection: 'http://localhost:3000',
      })
    );
  },
  components: {
    Editor,
    chatRoom
  },
  mounted: function(){

  },
  data() {
    return {
      // show
      show: false,
    };
  },
  mounted() {
    this.show = true;
  },
};
</script>

<style>
.session {
  height: 100vh;
}
</style>
