<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
   <!-- <HelloWorld msg="wadup coolman chat app"></HelloWorld>
   <editorTest></editorTest> -->
   <router-link to="editor">Editor</router-link>
   <router-view/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import editorTest from './components/editor.vue'


export default {
  name: 'app',
  components: {
    HelloWorld,

      editorTest

  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
