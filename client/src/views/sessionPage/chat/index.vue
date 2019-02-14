<template>
  <div class="chatroom">
    <div
      ref="msgs"
      class="msgs-wrapper"
      @scroll="onScroll"
    >
      <div
        v-if="hasMore"
        class="loader-wrapper"
      >
        <Loader color="red" />
      </div>
      <div
        v-for="(item, index) in msgs"
        :key="index"
        class="item-wrapper"
        :class="!item.hasPrev ? '' : 'same'"
      >
        <span
          v-if="!item.hasPrev"
          class="msg-circle"
          :class="item.type !== 'system' ? '' : 'arrow'"
          :style="{ fill: item.color }"
          v-html="
            item.type !== 'system'
              ? NameCircleIcon
              : `<img alt='arrow' src='${NameArrowIcon}' />`
          "
        />
        <div
          v-if="item.type !== 'system'"
          class="msg-wrapper"
        >
          <h6
            v-if="!item.hasPrev"
            class="msg-name"
          >
            {{ item.name }}
          </h6>
          <p
            v-if="!item.hasPrev"
            class="msg-date"
          >
            {{ item.date }}
          </p>
          <p class="msg">
            {{ item.msg }}
          </p>
        </div>
        <div
          v-else
          class="msg-wrapper"
        >
          <p class="msg msg-system">
            <span class="msg-name">
              {{ item.name }}
            </span> {{ item.msg }}
          </p>
          <p class="msg-date">
            {{ item.date }}
          </p>
        </div>
      </div>
    </div>
    <div>
      <transition name="scroll-down">
        <div
          v-if="isScrolling"
          class="scroll-down"
        >
          <img
            alt="arrow down"
            :src="ArrowDownIcon"
            class="arrow-down"
            @click="scrollToBottomSmoothly"
          />
        </div>
      </transition>
      <textarea
        ref="chat"
        class="msg-box"
        disabled
        rows="1"
        placeholder="Type a message..."
        type="text"
        :value="inputValue"
        @input="onInputChange"
        @keydown="onInputKeydown"
        @keyup="onInputKeyup"
      />
    </div>
  </div>
</template>

<script>
import Loader from '@/components/loader';

import ArrowDownIcon from '@/assets/arrow_down.png';
import NameArrowIcon from '@/assets/back.png';
import NameCircleIcon from '!raw-loader!@/assets/name_circle.svg';

import { formatDate, onScroll } from './methods';
import { onEnter, onChatSend, onChatScroll } from './socket';

export default {
  components: {
    Loader,
  },
  data() {
    return {
      // state
      hasMore: false,
      msgs: [],
      inputValue: '',
      isLoading: null,
      isScrolling: false,
      maxHeight: 85, // padding 10 each + border 1 each + (line height 21 * 3 lines)
      scrollTop: null,

      // assets
      ArrowDownIcon,
      NameArrowIcon,
      NameCircleIcon,
    };
  },
  methods: {
    formatDate,
    filterMsgs(msgs) {
      return msgs.map((msg, index) => {
        const prevMsg = msgs[index - 1];
        const currMsg = msgs[index];

        if (prevMsg && prevMsg.type !== 'system' && currMsg.type !== 'system') {
          const hasPrev =
            prevMsg.userId === currMsg.userId &&
            prevMsg.name === currMsg.name &&
            prevMsg.color === currMsg.color;
          return { ...msg, hasPrev };
        }
        return msg;
      });
    },
    onInputChange(e) {
      e.preventDefault();
      const { value } = e.target;
      this.inputValue = value;

      this.updateInputHeight();
      this.scrollToBottom();
    },
    onInputKeydown(e) {
      if (!e.shiftKey && e.keyCode === 13) {
        e.preventDefault();
      }
    },
    onInputKeyup(e) {
      if (!e.shiftKey && e.keyCode === 13) {
        e.preventDefault();

        const value = this.inputValue.trim();
        if (value) {
          this.sendChat(value);
        }
      }
    },
    onScroll,
    sendChat(value) {
      this.inputValue = '';
      this.$refs.chat.value = '';
      this.updateInputHeight();

      this.$socket.emit('chat:onChatSend', { msg: value });
      this.scrollToBottom();
    },
    scrollToBottom() {
      setTimeout(() => {
        this.$refs.msgs.scrollTop = this.$refs.msgs.scrollHeight;
      }, 0);
    },
    scrollToBottomSmoothly() {
      const { msgs } = this.$refs;
      msgs.scrollTo({
        top: msgs.scrollHeight,
        behavior: 'smooth',
      });
    },
    updateInputHeight() {
      const { chat } = this.$refs;
      chat.removeAttribute('style');
      chat.style.height = `${Math.min(
        chat.scrollHeight + 2,
        this.maxHeight,
      )}px`;
    },
  },
  sockets: {
    'socket:onEnter': onEnter,
    'chat:onChatSend': onChatSend,
    'chat:onChatScroll': onChatScroll,
  },
};
</script>

<style scoped>
.chatroom {
  background-color: #f7f7f7;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 70%;
  max-height: 600px;
  min-height: 300px;
  padding: 23px 29px;
}

.loader-wrapper {
  margin: auto;
  padding: 10px 0;
  width: fit-content;
}

.msg-box {
  background-color: var(--white-bg-color);
  border: 1px solid var(--gray-bg-color-2);
  border-radius: 8px;
  font-size: 15px;
  line-height: 21px;
  padding: 10px 25px;
  resize: none;
  width: 100%;
  will-change: height;
}

.msg-box::placeholder {
  color: #e5e5e5;
  font-weight: 300;
}

.msgs-wrapper {
  margin-bottom: 10px;
  padding-right: 20px;
  overflow: hidden auto;
}

.item-wrapper {
  align-items: flex-start;
  display: flex;
}

.item-wrapper:last-child {
  margin-bottom: 0;
}

.msg-circle {
  height: 60px;
  max-width: 60px;
  min-width: 60px;
  width: 60px;
}

.msg-circle.arrow {
  height: 40px;
  margin-top: -5px;
}

.msg-name {
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.2px;
  margin-top: 10px;
}

.msg-date {
  font-size: 12px;
  font-weight: 300;
  margin-top: 5px;
  margin-bottom: 10px;
}

.msg {
  font-size: 14px;
  line-height: 1.3em;
  margin-bottom: 10px;
  white-space: normal;
  word-break: break-all;
}

.same {
  padding-left: 60px;
}

.msg-system {
  margin-bottom: 0;
  margin-top: 10px;
  white-space: nowrap;
}

.scroll-down {
  position: absolute;
  width: 100%;
  text-align: center;
  transform: translateY(calc(-100% - 15px));
}

.arrow-down {
  background-color: #f7f7f7;
  border-radius: 50px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  height: 24px;
  overflow: auto;
  width: 24px;
}
</style>

<style>
.msg-circle > svg {
  height: 60px;
  width: 60px;
}

.msg-circle.arrow > img {
  display: block;
  height: 50px;
  margin: auto;
  margin-left: 5px;
  transform: scaleX(-1);
  width: 50px;
}

.scroll-down-enter-active,
.scroll-down-leave-active {
  transition: opacity var(--transition-duration) var(--transition-curve),
    transform var(--transition-duration) var(--transition-curve);
}

.scroll-down-enter {
  transform: translateY(0) !important;
}

.scroll-down-leave-to {
  opacity: 0;
}
</style>
