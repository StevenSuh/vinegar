<template>
  <div class="find-wrapper">
    <h2 class="find-action-header paddingTop large">
      {{ 'Hello, ' }}<span>User</span>
    </h2>
    <p class="find-action-message paddingTop small">
      Let's help you get started.
    </p>
    <div class="find-action-wrapper">
      <div class="find-action join" v-on:click="onClickJoin">
        <img class="action-box join-box" :src="joinBoxImage" alt="join box" />
        <p class="action-title">Join a Session</p>
        <p class="action-message">Looking for a session to join?</p>
      </div>
      <p class="find-action-p">or</p>
      <div class="find-action create" v-on:click="onClickCreate">
        <img
          class="action-box create-box"
          :src="createBoxImage"
          alt="create box"
        />
        <p class="action-title">Create a Session</p>
        <p class="action-message">Want to create a session?</p>
      </div>
    </div>
  </div>
</template>

<script>
import createBoxImage from '@/assets/create_box.png';
import joinBoxImage from '@/assets/join_box.png';

export default {
  data() {
    return {
      // assets
      createBoxImage,
      joinBoxImage,
    };
  },
  props: {
    onClickJoin: Function,
    onClickCreate: Function,
  },
};
</script>

<style scoped>
.find-wrapper {
  position: absolute;
  text-align: center;
  width: 100%;
}

.find-action-wrapper {
  align-items: center;
  display: flex;
  justify-content: space-evenly;
}

.find-action {
  cursor: pointer;
  height: 400px;
  width: 400px;
}

.find-action-header {
  font-size: 38px;
  font-weight: 500;
}

.find-action-header > span {
  color: var(--main-font-color);
}

.find-action-message,
.find-action-p {
  font-size: 18px;
}

.find-action-p {
  user-select: none;
}

.action-box {
  height: 100%;
  left: 0;
  object-fit: cover;
  object-position: left;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
}

.find-action:hover .action-box {
  object-position: right;
}

.action-title {
  font-size: 20px;
  font-weight: 500;
  margin-top: 272px;
  margin-bottom: 5px;
  user-select: none;
}

.action-message {
  font-size: 16px;
  user-select: none;
}

.find-action:hover .action-title,
.find-action:hover .action-message {
  color: var(--main-font-color);
}
</style>
