<template>
  <div class="intro">
    <h1>this is the landing page!!!!!!!</h1>
    <input type="text" id="roomName" value="somethingnotblank">
    <button id="enterRoom">
        enter
    </button>
  </div>
</template>

<script>
export default {
  name: 'introPage',
  mounted: function(){
      let button = document.getElementById("enterRoom")
      let roomName = document.getElementById("roomName")
      button.addEventListener("click", ()=>{
          this.$router.push(`editor/${roomName.value}`)
          

      })
  }
  
}
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
