<template>
  <transition name="fade">
    <div v-if="show">
      <div
        v-if="!isMobile"
        class="find"
      >
        <div class="container paddingTop">
          <nav class="navbar">
            <router-link
              v-if="isMakingChoice"
              class="back-button-wrapper hover"
              tag="a"
              to="/"
            >
              <img
                class="back-button"
                :src="backImage"
                alt="back button"
              />
            </router-link>
            <button
              v-else
              class="back-button-wrapper hover"
              @click="onSetIsMakingChoiceTrue"
            >
              <img
                class="back-button"
                :src="backImage"
                alt="back button"
              />
            </button>
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
                <div>
                  <transition name="fade">
                    <Decision
                      v-if="isMakingChoice"
                      :on-click-join="onClickJoin"
                      :on-click-create="onClickCreate"
                    />
                  </transition>
                  <transition name="fade">
                    <Join v-if="isJoiningSession" />
                  </transition>
                  <transition name="fade">
                    <Create v-if="isCreatingSession" />
                  </transition>
                </div>
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
      <div
        v-else
        class="find"
      >
        <!-- TODO -->
        can't do mobile
      </div>
    </div>
  </transition>
</template>

<script>
import { signIn } from '@/services/api';
import Loader from '@/components/loader';
import Decision from '@/views/findPage/decision';
import Join from '@/views/findPage/join';
import Create from '@/views/findPage/create';
import ButtonComponent from '@/components/button';

import { MIN_MOBILE_WIDTH } from '@/defs';

import backImage from '@/assets/back.png';
import leftImage from '@/assets/find_left.png';
import rightImage from '@/assets/find_right.png';

export default {
  components: {
    ButtonComponent,
    Create,
    Join,
    Loader,
    Decision,
  },
  data() {
    return {
      // state
      isMobile: window.innerWidth <= MIN_MOBILE_WIDTH,
      isMakingChoice: true,
      isJoiningSession: false,
      isCreatingSession: false,
      loaded: false,
      show: false,

      // assets
      backImage,
      leftImage,
      rightImage,
    };
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  beforeCreate() {
    document.title = 'Vinegar - App';
  },
  created() {
    window.addEventListener('resize', this.onResize);
  },
  mounted() {
    this.show = true;
    this.onInit();
  },
  methods: {
    onClickJoin() {
      this.isMakingChoice = false;
      this.isJoiningSession = true;
    },
    onClickCreate() {
      this.isMakingChoice = false;
      this.isCreatingSession = true;
    },
    async onInit() {
      await signIn();
      this.loaded = true;
    },
    onResize() {
      this.isMobile = window.innerWidth <= MIN_MOBILE_WIDTH;
    },
    onSetIsMakingChoiceTrue() {
      this.isMakingChoice = true;
      this.isJoiningSession = false;
      this.isCreatingSession = false;
    },
  },
};
</script>

<style scoped>
.find {
  height: 100vh;
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
</style>
