<template>
  <transition name="fade">
    <div v-if="show">
      <div class="landing">
        <div class="container paddingTop">
          <nav class="navbar">
            <h2 class="nav-header">Vinegar</h2>
            <div class="nav-items">
              <button class="marginRight small" ref="about" type="minimal">
                <p>About</p>
              </button>
              <button ref="oauth" type="primary">
                <a
                  :href="signinUrl"
                  v-if="signinUrlLoaded && signinUrl !== '/find'"
                >
                  Login
                </a>
                <router-link
                  tag="a"
                  to="/find"
                  v-else-if="signinUrlLoaded && signinUrl === '/find'"
                >
                  Login
                </router-link>
                <span class="oauth-placeholder" v-else>
                  <span class="loader-absolute">
                    <Loader color="white" />
                  </span>
                </span>
              </button>
            </div>
          </nav>
        </div>
        <div class="content marginTop small">
          <img class="left" :src="leftAsset" alt="landing asset left" />
          <div class="content-message">
            <h1 class="content-header">Divide and Conquer.</h1>
            <p class="content-p marginTop marginBottom">
              Take notes in a distributed manner.
            </p>
            <button type="primary" size="larger">
              <router-link tag="a" to="/find"> Join Your Class </router-link>
            </button>
          </div>
          <img class="right" :src="rightAsset" alt="landing asset right" />
        </div>
      </div>
      <div class="section-how">
        <div class="container paddingTop paddingBottom">
          <h2>How to Use</h2>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Button from '@/components/button.vue';
import Loader from '@/components/loader.vue';
import {getSigninUrl} from '@/services/api';

import leftAsset from '@/assets/landing_left.png';
import rightAsset from '@/assets/landing_right.png';

export default {
  components: {
    Button,
    Loader,
  },
  data() {
    return {
      leftAsset,
      rightAsset,
      show: false,
      signinUrlLoaded: false,
      signinUrl: '',
    };
  },
  name: 'introPage',
  methods: {
    async onInit() {
      this.signinUrl = await getSigninUrl();
      this.signinUrlLoaded = true;
    },
  },
  mounted: async function() {
    await this.onInit();
    this.show = true;
  },
};
</script>

<style scoped>
.landing {
  display: flex;
  flex-direction: column;
  height: 97vh;
  width: 100%;
}

.navbar {
  align-items: baseline;
  display: flex;
  justify-content: space-between;
}

.nav-header {
  color: var(--main-font-color);
  font-size: 38px;
  font-weight: 500;
}

.oauth-placeholder::before {
  content: 'Login';
  opacity: 0;
}

.loader-absolute {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  top: 50%;
}

.content {
  align-items: flex-start;
  display: flex;
  flex: 1;
  justify-content: space-between;
}

.content > .left,
.content > .right {
  flex: 0;
  height: 100%;
  object-fit: contain;
  width: auto;
}

.content > .left {
  object-position: left;
}

.content > .right {
  object-position: right;
}

.content-message {
  padding-top: 10%;
  text-align: center;
}

.content-header {
  font-size: 68px;
  font-weight: 500;
}

.content-p {
  font-size: 18px;
}

.section-how {
  background-color: var(--gray-bg-color);
}
</style>
