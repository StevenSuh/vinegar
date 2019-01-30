<template>
  <div id="createSession">
    <div>create session</div>
    <form>
      <input id="schoolName" type="text" value="school name here" />
      <input id="sessionName" type="text" value="course title here" />
      <input id="submit" type="submit" value="Submit" />
    </form>
  </div>
</template>

<script>
import { postSession } from '@/services/api';

export default {
  mounted() {
    document.getElementById('submit').addEventListener('click', async event => {
      event.preventDefault();
      const post = await postSession({
        schoolName: document.getElementById('schoolName').value,
        sessionName: document.getElementById('sessionName').value,
      });
      if (post.created) {
        alert(`created new room ${post.schoolName} - ${post.sessionName}`);
      } else {
        alert(
          `${post.schoolName} - ${
            post.sessionName
          } already exists. Redirecting you there...`,
        );
      }
      this.$router.push(`session/${post.schoolName}/${post.sessionName}`);
    });
  },
};
</script>
