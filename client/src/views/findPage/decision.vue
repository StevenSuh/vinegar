<template>
  <div class="find-wrapper">
    <h2 class="find-action-header paddingTop large">
      {{ 'Hello, ' }}<span>User</span>
    </h2>
    <p class="find-action-message paddingTop small">
      Let's help you get started.
    </p>
    <div class="find-action-wrapper">
      <div
        class="find-action join"
        @click="onClickJoin"
      >
        <div class="find-action-inner-wrapper">
          <img
            class="action-box join-box"
            :src="joinBoxImage"
            alt="join box"
          />
          <p class="action-title">
            Join a Session
          </p>
          <p class="action-message">
            Looking for a session to join?
          </p>
        </div>
      </div>
      <div
        class="find-action create"
        @click="onClickCreate"
      >
        <div class="find-action-inner-wrapper">
          <img
            class="action-box create-box"
            :src="createBoxImage"
            alt="create box"
          />
          <p class="action-title">
            Create a Session
          </p>
          <p class="action-message">
            Want to create a session?
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import createBoxImage from '@/assets/create_box.png';
import joinBoxImage from '@/assets/join_box.png';

export default {
  props: {
    onClickJoin: Function,
    onClickCreate: Function,
  },
  data() {
    return {
      // assets
      createBoxImage,
      joinBoxImage,
    };
  },
};
</script>

<style scoped>
.find-wrapper {
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
  padding-top: 45%;
  width: 45%;
}

.find-action-inner-wrapper {
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

.find-action-header {
  font-size: 38px;
  font-weight: 500;
}

.find-action-header > span {
  color: var(--main-font-color);
}

.find-action-message {
  font-size: 18px;
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
  margin-top: 68%;
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

@media (min-width: 1200px) {
  .find-action {
    padding-top: 35%;
    width: 35%;
  }
}
</style>
