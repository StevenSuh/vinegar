<template>
  <div>
    <div id="chatRoom">
      <div id="chatMessages">
        <p v-for="message in messages" v-bind:key="messages.indexOf(message)">
          {{ message.name }} {{ message.message }}
        </p>
      </div>
      <div id="chatInput">
        <input type="text" id="messageBox"/>
        <button id="send">send </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return {
      messages: [],
    }
  },
  sockets:{
    onChatSend: function(data){
      this.messages.push(data);
    },
  },
  mounted: function(){
    document.getElementById("send").addEventListener("click", () => {
      let messageBox = document.getElementById("messageBox");
      let message = messageBox.value;
      let name = "example name"; //TODO set actual name
      this.$socket.emit('onChatSend', {
        name: name,
        message: message,
        userId: this.userId,
      });
      messageBox.value = "";
    });
    document.getElementById("messageBox").addEventListener("keyup", event => {
      if (event.keyCode === 13) {
        document.getElementById("send").click();
      }
    });
  },
  props: {
    userId: String,
  },
};
</script>
