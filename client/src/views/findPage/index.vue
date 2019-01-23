<template>
  <transition name="fade">
    <div v-if="show">
      <div class="find" v-if="!isMobile">
        <div class="container paddingTop">
          <nav class="navbar">
            <router-link class="back-button-wrapper hover" tag="a" to="/">
              <img class="back-button" :src="backImage" alt="back button" />
            </router-link>
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
                    <SessionDecision
                      v-if="isMakingChoice"
                      :onClickJoin="onClickJoin"
                      :onClickCreate="onClickCreate"
                    />
                  </transition>
                  <transition name="fade">
                    <JoinSession v-if="isJoiningSession" />
                  </transition>
                  <transition name="fade">
                    <CreateSession v-if="isCreatingSession" />
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
import {getAuthStatus, getSigninUrl} from '@/services/api';
import Loader from '@/components/loader';
import SessionDecision from '@/views/findPage/sessionDecision';
import JoinSession from '@/views/findPage/joinSession';
import CreateSession from '@/views/findPage/createSession';

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
    CreateSession,
    JoinSession,
    Loader,
    SessionDecision,
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
      uid: '',

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
      const {isAuthenticated, uid = ''} = await getAuthStatus();
      setTimeout(() => {
        this.isAuthenticated = isAuthenticated;
        this.loaded = true;
        this.uid = uid;
      }, 2000);
    },
    onResize: function() {
      this.isMobile = window.innerWidth <= MIN_MOBILE_WIDTH;
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
  transform: scale(0.45);
  transform-origin: 0 100%;
}

.find-right-img {
  bottom: 0;
  right: 40px;
  pointer-events: none;
  position: absolute;
  transform: scale(0.45);
  transform-origin: 100% 100%;
}
</style>
