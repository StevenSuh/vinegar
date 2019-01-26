<template>
  <div id="createSession">
    <div>create session</div>
    <form>

      <input type="text" id="schoolName" value="school name here">
      <input type="text" id="sessionName" value="course title here">
      <input id="submit" type="submit" value="Submit">
    </form>
  </div>
</template>

<script>
import {postSession} from "@/services/api"
export default {
  mounted: function(){
    document.getElementById("submit").addEventListener("click", async (event)=>{
      event.preventDefault();
      console.log( await postSession({
        schoolName: document.getElementById("schoolName").value,
        sessionName: document.getElementById("sessionName").value
      }))
    })
  }
};
</script>
