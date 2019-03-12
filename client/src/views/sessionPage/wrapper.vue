<template>
  <transition name="fade">
    <div
      v-if="show"
      class="session"
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
          @click="onClickBack"
        />
      </router-link>
      <Headline
        class="headline"
        :socket="socket"
      />
      <div class="left">
        <h1 class="name-wrapper">
          <span class="school-name"> {{ school }} </span> {{ ' / ' }}
          <span class="session-name"> {{ session }} </span>
        </h1>
        <div class="editor-wrapper">
          <Editor :socket="socket" />
        </div>
        <Control :socket="socket" />
      </div>
      <div class="right">
        <People
          class="people-wrapper paddingTop small"
          :socket="socket"
        />
        <Chat
          class="chat-wrapper"
          :socket="socket"
        />
      </div>
    </div>
  </transition>
</template>

<script>
import Chat from '@/views/sessionPage/chat';
import Control from '@/views/sessionPage/control';
import Editor from '@/views/sessionPage/editor';
import Headline from '@/views/sessionPage/headline';
import People from '@/views/sessionPage/people';

import { socketMixin } from '@/services/socket';
import { handleErrorMiddleware } from '@/services/middleware';

import backImage from '@/assets/back.png';

import { DUPLICATE_MSG } from '@/defs';

export default {
  components: {
    Chat,
    Control,
    Editor,
    Headline,
    People,
  },
  mixins: [socketMixin],
  props: {
    socket: [Object, WebSocket],
  },
  data() {
    return {
      // state
      school: this.$route.params.school,
      session: this.$route.params.session,
      show: false,

      // assets
      backImage,
    };
  },
  watch: {
    errorModal(value) {
      if (value !== this.error) {
        this.error = value;
      }
    },
  },
  mounted() {
    this.show = true;
  },
  methods: {
    onClickBack() {
      this.socket.closeSocket();
    },
  },
  sockets: {
    error(err) {
      handleErrorMiddleware(err, 'socket');
    },
    close() {
      const { school, session } = this;
      handleErrorMiddleware(
        `You have been disconnected from session: ${school}/${session}.`,
        'socket',
      );
      this.socket.closeSocket();
    },
    'socket:onException': function({ errorMessage }) {
      handleErrorMiddleware(errorMessage, 'socket');
    },
    'socket:onDuplicate': function() {
      handleErrorMiddleware(DUPLICATE_MSG, 'socket');
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

.name-wrapper {
  font-size: 22px;
  font-weight: 400;
  line-height: 44px;
  padding-bottom: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: top;
}

.school-name {
  font-size: 36px;
  font-weight: 500;
  line-height: 44px;
  vertical-align: bottom;
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
  left: 20px;
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

.headline {
  position: absolute;
  right: 20px;
  top: 15px;
}

.left {
  padding-right: 25px;
  width: 60%;
}

.right {
  padding-left: 25px;
  width: 40%;
}

.editor-wrapper {
  height: 70%;
  width: 100%;
  min-height: 450px;
}

.chat-wrapper {
  height: 60%;
}

.people-wrapper {
  height: 40%;
}

@media (max-width: 1000px) {
  .session {
    padding: 15px 20px;
  }

  .back-button-wrapper,
  .headline {
    display: none;
  }
}

@media (max-width: 700px) {
  .session {
    flex-direction: column;
    height: auto;
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

  .people-wrapper {
    padding-bottom: 20px;
  }
}
</style>
