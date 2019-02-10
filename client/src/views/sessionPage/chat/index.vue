<template>
  <div class="chatroom">
    <div class="msgs-wrapper" ref="msgs">
      <div
        class="item-wrapper"
        v-for="(item, index) in msgs"
        :key="index"
      >
        <span
          class="msg-circle"
          :style="{ fill: item.color }"
          v-html="NameCircleIcon"
        />
        <div class="msg-wrapper">
          <h6 class="msg-name">{{ item.name }}</h6>
          <p class="msg-date">{{ item.date }}</p>
          <p class="msg">{{ item.msg }}</p>
        </div>
      </div>
    </div>
    <div>
      <textarea
        class="msg-box"
        disabled
        ref="chat"
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
import NameCircleIcon from '!raw-loader!@/assets/name_circle.svg';

export default {
  data() {
    return {
      // state
      hasMore: false,
      msgs: [],
      inputValue: '',
      maxHeight: 85, // padding 10 each + border 1 each + (line height 21 * 3 lines)

      // assets
      NameCircleIcon,
    };
  },
  methods: {
    onInputChange(e) {
      e.preventDefault();
      const { value } = e.target;
      this.inputValue = value;

      this.updateInputHeight();
    },
    onInputKeydown(e) {
      if (!e.shiftKey && e.keyCode === 13) {
        e.preventDefault();
      }
    },
    onInputKeyup(e) {
      if (!e.shiftKey && e.keyCode === 13 && this.inputValue.length > 0) {
        e.preventDefault();
        this.sendChat();
        return false;
      }
    },
    formatDate(date) {
      const localDate = new Date(date);
      const hour = localDate.getHours();
      let minute = localDate.getMinutes();
      minute = (minute < 10) ? `0${minute}` : minute;
      const amPm = (hour < 12) ? 'AM' : 'PM';

      return `${hour}:${minute} ${amPm}`;
    },
    sendChat() {
      const value = this.inputValue.trim();

      this.inputValue = '';
      this.$refs.chat.value = '';
      this.updateInputHeight();

      if (value) {
        this.$socket.emit('onChatSend', { msg: value });
        this.scrollToBottom();
      }
    },
    scrollToBottom() {
      setTimeout(() => {
        this.$refs.msgs.scrollTop = this.$refs.msgs.scrollHeight;
      }, 0);
    },
    updateInputHeight() {
      const { chat } = this.$refs;
      chat.removeAttribute('style');
      chat.style.height = Math.min(chat.scrollHeight + 2, this.maxHeight) + 'px';
    },
  },
  sockets: {
    'socket:onEnter': function({ hasMore, msgs }) {
      this.msgs = msgs.map(msg => {
        msg.date = this.formatDate(msg.date);
        return msg;
      });
      this.hasMore = hasMore;
      this.$refs.chat.disabled = false;
      this.scrollToBottom();
    },
    onChatSend(data) {
      const { msgs } = this.$refs;
      const isAtBottom = (msgs.scrollHeight - msgs.clientHeight) === msgs.scrollTop;

      this.msgs.push({
        ...data,
        date: this.formatDate(data.date),
      });

      if (isAtBottom) {
        this.scrollToBottom();
      }
    },
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
  height: 60%;
  max-height: 600px;
  min-height: 300px;
  padding: 23px 29px;
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
  margin-bottom: 20px;
  overflow: hidden auto;
}

.item-wrapper {
  align-items: flex-start;
  display: flex;
  margin-bottom: 10px;
}

.item-wrapper:last-child {
  margin-bottom: 0;
}

.msg-circle {
  height: 80px;
  max-width: 80px;
  min-width: 80px;
  width: 80px;
}

.msg-wrapper {
  padding-right: 20px;
}

.msg-name {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.2px;
  margin-top: 15px;
}

.msg-date {
  font-size: 14px;
  font-weight: 300;
  margin-top: 5px;
  margin-bottom: 10px;
}

.msg {
  font-size: 16px;
  line-height: 1.3em;
  white-space: pre-wrap;
}
</style>
