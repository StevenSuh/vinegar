<template>
  <transition name="fade">
    <div v-if="show" class="session">
      <router-link
        class="back-button-wrapper hover"
        tag="a"
        to="/find"
      >
        <img
          class="back-button"
          :src="backImage"
          alt="back button"
        />
      </router-link>
      <div class="left">
        <h1 class="school-name">
          {{ school }}
          <span class="session-name">
            {{ ' / ' }}
            {{ session }}
          </span>
        </h1>
        <div class="editor-wrapper">
          <Editor
            :session="$route.params.session"
            :school="$route.params.school"
          />
        </div>
      </div>
      <div class="right">
        <Chat />
      </div>
      <transition name="fadeNoDelay">
        <Welcome
          :onClose="onCloseIsWelcome"
          v-if="isWelcome"
        />
      </transition>
    </div>
  </transition>
</template>

<script>
import Vue from 'vue';
import VueSocketIO from 'vue-socket.io';

import Chat from '@/views/sessionPage/chat';
import Editor from '@/views/sessionPage/editor';
import Welcome from '@/views/sessionPage/welcomeModal';

import backImage from '@/assets/back.png';

export default {
  components: {
    Editor,
    Chat,
    Welcome,
  },
  data() {
    return {
      // state
      school: this.$route.params.school,
      session: this.$route.params.session,
      show: false,
      isWelcome: true,

      // assets
      backImage,
    };
  },
  beforeCreate() {
    Vue.use(new VueSocketIO({ connection: '/' }));
  },
  mounted() {
    this.show = true;
  },
  methods: {
    onCloseIsWelcome(data) {
      this.isWelcome = false;
      this.$socket.emit('socket:onEnter', data);
    },
  },
  sockets: {},
};
</script>

<style scoped>
.session {
  display: flex;
  flex-direction: row;
  height: 100vh;
  padding: 60px 70px;
}

.school-name {
  font-size: 36px;
  font-weight: 500;
  line-height: 44px;
  padding-bottom: 20px;
}

.session-name {
  font-size: 22px;
  font-weight: 400;
  opacity: 0.9;
  line-height: 44px;
  vertical-align: top;
}

.back-button-wrapper {
  cursor: pointer;
  position: absolute;
  left: 15px;
  height: 40px;
  top: 15px;
  width: 40px;
}

.back-button {
  left: -5px;
  height: 50px;
  top: -5px;
  width: 50px;
}

.left {
  padding-right: 20px;
  min-width: 533px;
  width: 65%;
}

.right {
  padding-left: 20px;
  min-width: 287px;
  width: 35%;
}

.editor-wrapper {
  height: 70%;
  width: 100%;
  min-height: 500px;
}

@media (max-width: 1000px) {
  .session {
    padding: 15px 20px;
  }

  .back-button-wrapper {
    display: none;
  }
}

@media (max-width: 700px) {
  .session {
    flex-direction: column;
  }

  .school-name {
    padding-bottom: 10px;
  }

  .left,
  .right {
    padding-left: 0;
    padding-right: 0;
    width: 100%;
  }
}
</style>
