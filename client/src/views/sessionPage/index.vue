<template>
  <div id="sessionPage">
    <Editor :session="$route.params.session" :school="$route.params.school" />
    <chatRoom/>
  </div>

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
};
</script>
