<template>
  <div class="intro">
    <h1>this is the landing page!!!!!!!</h1>
    <input type="text" id="roomName" value="somethingnotblank" /> <br />
    <button id="enterRoom">enter</button>
    <button id="oauth">
      <a v-if="signinUrlLoaded" :href="signinUrl">Sign In</a>
      <span v-else>...</span>
    </button>
  </div>
</template>

<script>
  import { getSigninUrl } from '../services/api';

  export default {
    data() {
      return {
        signinUrlLoaded: false,
        signinUrl: '',
      };
    },
    name: 'introPage',
    methods: {
      async onInit() {
        const res = await getSigninUrl();

        this.signinUrl = res.signinUrl;
        this.signinUrlLoaded = true;
      },
    },
    mounted() {
      let button = document.getElementById('enterRoom');
      let roomName = document.getElementById('roomName');
      button.addEventListener('click', () => {
        this.$router.push(`editor/${roomName.value}`);
      });

      this.onInit();
    },
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
