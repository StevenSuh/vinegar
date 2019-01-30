<template>
  <transition name="fade">
    <div v-if="show">
      <div class="find" v-if="!isMobile">
        <div class="container paddingTop">
          <nav class="navbar">
            <router-link
              class="back-button-wrapper hover"
              tag="a"
              to="/"
              v-if="isMakingChoice"
            >
              <img class="back-button" :src="backImage" alt="back button" />
            </router-link>
            <button
              class="back-button-wrapper hover"
              v-else
              v-on:click="onSetIsMakingChoiceTrue"
            >
              <img class="back-button" :src="backImage" alt="back button" />
            </button>
            <h2 class="nav-header">Vinegar</h2>
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
        <div class="container">
          <transition name="fade">
            <div v-if="loaded">
              <transition name="fade">
                <div v-if="isAuthenticated">
                  <transition name="fade">
                    <Decision
                      v-if="isMakingChoice"
                      :onClickJoin="onClickJoin"
                      :onClickCreate="onClickCreate"
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
              <transition name="fade">
                <div v-if="!isAuthenticated">
                  <!-- TODO -->
                  Not auth :(
                </div>
              </transition>
            </div>
          </transition>
          <transition name="fade">
            <div class="loader-wrapper" v-if="!loaded">
              <Loader class="loader" color="red" size="large" />
              <p class="loader-caption marginTop">Loading content</p>
            </div>
          </transition>
        </div>
      </div>
      <div class="find" v-else>
        <!-- TODO -->
        can't do mobile
      </div>
    </div>
  </transition>
</template>

<script>
import {getAuthStatus} from '@/services/api';
import Loader from '@/components/loader';
import Decision from '@/views/findPage/decision';
import Join from '@/views/findPage/join';
import Create from '@/views/findPage/create';

import {MIN_MOBILE_WIDTH} from '@/defs';

import backImage from '@/assets/back.png';
import leftImage from '@/assets/find_left.png';
import rightImage from '@/assets/find_right.png';

export default {
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  created() {
    window.addEventListener('resize', this.onResize);
  },
  components: {
    Create,
    Join,
    Loader,
    Decision,
  },
  data() {
    return {
      // state
      isAuthenticated: false,
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
  methods: {
    onClickJoin: function() {
      this.isMakingChoice = false;
      this.isJoiningSession = true;
    },
    onClickCreate: function() {
      this.isMakingChoice = false;
      this.isCreatingSession = true;
    },
    onInit: async function() {
      const {isAuthenticated} = await getAuthStatus();
      this.isAuthenticated = isAuthenticated;
      this.loaded = true;
    },
    onResize: function() {
      this.isMobile = window.innerWidth <= MIN_MOBILE_WIDTH;
    },
    onSetIsMakingChoiceTrue: function() {
      this.isMakingChoice = true;
      this.isJoiningSession = false;
      this.isCreatingSession = false;
    },
  },
  mounted: function() {
    this.show = true;
    this.onInit();
  },
};
</script>

<style scoped>
.find {
  height: 100vh;
}

.loader-wrapper {
  left: 50%;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
}

.loader {
  margin: auto;
}

.loader-caption {
  color: var(--gray-font-color);
  text-align: center;
}

.navbar {
  align-items: baseline;
  display: flex;
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
