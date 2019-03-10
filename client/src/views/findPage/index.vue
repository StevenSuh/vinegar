<template>
  <transition name="fade">
    <div v-if="show">
      <div class="find">
        <div class="container paddingTop">
          <nav class="navbar">
            <router-link
              class="back-button-wrapper hover"
              tag="a"
              :to="$route.path === '/app/find' ? '/' : '/app/find'"
            >
              <img
                class="back-button"
                :src="backImage"
                alt="back button"
              />
            </router-link>
            <h2 class="nav-header">
              Vinegar
            </h2>
          </nav>
        </div>
        <img
          class="find-left-img"
          :src="leftImage"
          alt="find page left asset"
        />
        <img
          class="find-right-img"
          :src="rightImage"
          alt="find page right asset"
        />
        <div class="container tight">
          <transition name="fade">
            <div v-if="loaded">
              <transition name="fade">
                <router-view />
              </transition>
            </div>
          </transition>
          <transition name="fade">
            <div
              v-if="!loaded"
              class="loader-wrapper"
            >
              <Loader
                class="loader"
                color="red"
                size="large"
              />
              <p class="loader-caption marginTop">
                Loading content
              </p>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { signIn } from '@/services/api';
import Loader from '@/components/loader';

import backImage from '@/assets/back.png';
import leftImage from '@/assets/find_left.png';
import rightImage from '@/assets/find_right.png';

export default {
  components: {
    Loader,
  },
  data() {
    return {
      // state
      loaded: false,
      show: false,

      // assets
      backImage,
      leftImage,
      rightImage,
    };
  },
  beforeCreate() {
    document.title = 'Vinegar - Note Taking App';
  },
  mounted() {
    this.show = true;
    this.onInit();
  },
  methods: {
    async onInit() {
      await signIn();
      this.loaded = true;
    },
  },
};
</script>

<style scoped>
.find {
  height: auto;
  min-height: 100vh;
}

.loader-wrapper {
  left: 50%;
  height: auto !important;
  position: fixed !important;
  top: 50%;
  transform: translate(-50%, -50%);
  width: auto !important;
}

.loader {
  margin: auto;
}

.loader-caption {
  color: var(--gray-font-color);
  text-align: center;
}

.navbar {
  align-items: flex-end;
  display: flex;
  justify-content: space-between;
}

.sign-out > p {
  font-size: 16px;
}

.nav-header {
  color: var(--main-font-color);
  font-size: 38px;
  font-weight: 500;
}

.back-button-wrapper {
  cursor: pointer;
  position: absolute;
  left: calc(-60px - 5px);
  height: 60px;
  top: calc(50% + 2px);
  transform: translateY(-50%);
  width: 60px;
}

.back-button {
  height: 60px;
  width: 60px;
}

.find-left-img {
  bottom: 0;
  left: 0;
  pointer-events: none;
  position: absolute;
  height: 85%;
}

.find-right-img {
  bottom: 0;
  right: 40px;
  pointer-events: none;
  position: absolute;
  height: 85%;
}

@media (max-width: 540px) {
  .find-left-img,
  .find-right-img {
    display: none;
  }
}
</style>
