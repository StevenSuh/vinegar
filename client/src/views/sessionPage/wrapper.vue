<template>
  <transition name="fade">
    <div
      v-if="show"
      class="session"
      :class="hide ? 'hide' : ''"
    >
      <router-link
        class="back-button-wrapper hover"
        tag="a"
        to="/app/find"
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
            {{ ' / ' }} {{ session }}
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
          v-if="isWelcome"
          :on-close="onCloseIsWelcome"
          :on-show="onShow"
        />
      </transition>
    </div>
  </transition>
</template>

<script>
import Chat from '@/views/sessionPage/chat';
import Editor from '@/views/sessionPage/editor';
import Welcome from '@/views/sessionPage/welcomeModal';

import { handleErrorMiddleware } from '@/services/middleware';

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
      errorModal: false,
      hide: true,
      school: this.$route.params.school,
      session: this.$route.params.session,
      show: false,
      isWelcome: true,

      // assets
      backImage,
    };
  },
  mounted() {
    this.$socket.emit('socket:init');
    this.show = true;
  },
  methods: {
    onCloseIsWelcome() {
      this.isWelcome = false;
      setTimeout(() => {
        this.hide = false;
        this.$socket.emit('socket:onEnter');
      }, 200);
    },
    onShow() {
      this.hide = false;
    },
  },
  sockets: {
    error(err) {
      handleErrorMiddleware(err, 'socket');
    },
    'socket:exception': function({ errorMessage }) {
      handleErrorMiddleware(errorMessage, 'socket');
    },
    'socket:duplicate': function() {
      this.$router.push('/app/find');
    },
  },
};
</script>

<style scoped>
.session {
  display: flex;
  flex-direction: row;
  height: 100vh;
  padding: 60px 70px;
  transition: opacity var(--transition-duration) var(--transition-curve);
  transition-delay: 0.3s;
}

.session.hide {
  opacity: 0;
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
  padding-right: 25px;
  min-width: 492px;
  width: 60%;
}

.right {
  padding-left: 25px;
  min-width: 328px;
  width: 40%;
}

.editor-wrapper {
  height: 70%;
  width: 100%;
  min-height: 450px;
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

  .right {
    margin-top: 20px;
  }
}
</style>
