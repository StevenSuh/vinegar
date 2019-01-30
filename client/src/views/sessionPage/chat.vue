<template>
  <div>
    <div id="chatRoom">
      <div id="chatMessages">
        <p v-for="message in messages" :key="messages.indexOf(message)">
          {{ message.name }} {{ message.message }}
        </p>
      </div>
      <div id="chatInput">
        <input id="messageBox" type="text" /> <button id="send">send</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    userId: String,
  },
  data() {
    return {
      messages: [],
    };
  },
  sockets: {
    onChatSend(data) {
      this.messages.push(data);
    },
  },
  mounted() {
    document.getElementById('send').addEventListener('click', () => {
      const messageBox = document.getElementById('messageBox');
      const message = messageBox.value;
      const name = 'example name'; // TODO set actual name
      this.$socket.emit('onChatSend', {
        name,
        message,
        userId: this.userId,
      });
      messageBox.value = '';
    });
    document.getElementById('messageBox').addEventListener('keyup', event => {
      if (event.keyCode === 13) {
        document.getElementById('send').click();
      }
    });
  },
};
</script>
