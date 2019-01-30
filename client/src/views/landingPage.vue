<template>
  <transition name="fade">
    <div v-if="show">
      <div class="landing">
        <div class="container paddingTop">
          <nav class="navbar">
            <h2 class="nav-header">Vinegar</h2>
            <div class="nav-items">
              <ButtonComponent class="marginRight small" type="minimal">
                <p @click="onClickAbout">About</p>
              </ButtonComponent>
              <ButtonComponent type="primary">
                <a
                  v-if="signinUrlLoaded && signinUrl !== '/find'"
                  :href="signinUrl"
                >
                  Login
                </a>
                <router-link
                  v-else-if="signinUrlLoaded && signinUrl === '/find'"
                  tag="a"
                  to="/find"
                >
                  Login
                </router-link>
                <span v-else class="oauth-placeholder">
                  <span class="loader-absolute">
                    <Loader color="white" />
                  </span>
                </span>
              </ButtonComponent>
            </div>
          </nav>
        </div>
        <div class="content marginTop small">
          <img class="left" :src="leftImage" alt="landing asset left" />
          <div class="content-message">
            <h1 class="content-header">Divide and Conquer.</h1>
            <p class="content-p marginTop marginBottom">
              Loading balancing meets higher education.
            </p>
            <ButtonComponent type="primary" size="large">
              <router-link tag="a" to="/find"> Join Your Session </router-link>
            </ButtonComponent>
          </div>
          <img class="right" :src="rightImage" alt="landing asset right" />
        </div>
      </div>
      <div ref="how" class="section-how paddingTop paddingBottom small">
        <div class="container paddingTop paddingBottom">
          <h2 class="how-header">How to Use</h2>
          <div class="how-items marginTop marginBottom large">
            <div class="how-item">
              <div class="how-item-icon-wrapper">
                <img
                  class="how-item-icon"
                  :src="findSessionImage"
                  alt="find session asset"
                />
              </div>
              <p class="how-item-caption marginTop small">
                Create or join a session
              </p>
            </div>
            <div class="how-item">
              <div class="how-item-icon-wrapper">
                <img
                  class="how-item-icon"
                  :src="alarmClockImage"
                  alt="alarm clock asset"
                />
              </div>
              <p class="how-item-caption marginTop small">
                Timer starts when everyone joins
              </p>
            </div>
            <div class="how-item">
              <div class="how-item-icon-wrapper">
                <img
                  class="how-item-icon"
                  :src="exclamationImage"
                  alt="exclamation asset"
                />
              </div>
              <p class="how-item-caption marginTop small">
                Begin taking notes when notified
              </p>
            </div>
            <div class="how-item">
              <div class="how-item-icon-wrapper">
                <img class="how-item-icon" :src="mugImage" alt="mug asset" />
              </div>
              <p class="how-item-caption marginTop small">
                Meanwhile, enjoy doing something else!
              </p>
            </div>
          </div>
          <ButtonComponent class="how-start" size="medium" type="primary">
            <router-link tag="a" to="/find"> Get Started </router-link>
          </ButtonComponent>
        </div>
      </div>
      <div class="section-team paddingTop paddingBottom">
        <div class="container paddingTop paddingBottom">
          <h2 class="team-header marginBottom">The Team</h2>
          <div class="team-items marginBottom large">
            <div class="team-item">
              <img
                class="team-item-icon"
                :src="jeffreImage"
                alt="jeffre asset"
              />
              <p class="team-item-name">Jeffre</p>
              <p class="team-item-caption">{{ 'Skater & Bass Player' }}</p>
              <div class="team-item-links">
                <a
                  href="https://www.linkedin.com/in/jeffreyyang3"
                  target="_blank"
                >
                  <img
                    class="team-item-links-img hover"
                    :src="linkedinImage"
                    alt="linkedin square"
                  />
                </a>
                <a href="https://github.com/jeffreyyang3" target="_blank">
                  <img
                    class="team-item-links-img hover"
                    :src="githubImage"
                    alt="github"
                  />
                </a>
                <a href="https://jeffreyyang3.github.io" target="_blank">
                  <img
                    class="team-item-links-img hover"
                    :src="heartImage"
                    alt="heart"
                  />
                </a>
              </div>
            </div>
            <div class="team-item">
              <img class="team-item-icon" :src="lyanaImage" alt="lyana asset" />
              <p class="team-item-name">Lyana</p>
              <p class="team-item-caption">{{ 'Dog & Roomba Lover' }}</p>
              <div class="team-item-links">
                <a href="https://www.linkedin.com/in/lyanna-ho" target="_blank">
                  <img
                    class="team-item-links-img hover"
                    :src="linkedinImage"
                    alt="linkedin square"
                  />
                </a>
                <a href="https://github.com/lyannerz" target="_blank">
                  <img
                    class="team-item-links-img hover"
                    :src="githubImage"
                    alt="github"
                  />
                </a>
                <a href="https://lyannerz.github.io" target="_blank">
                  <img
                    class="team-item-links-img hover"
                    :src="heartImage"
                    alt="heart"
                  />
                </a>
              </div>
            </div>
            <div class="team-item">
              <img class="team-item-icon" :src="steveImage" alt="steve asset" />
              <p class="team-item-name">Steve</p>
              <p class="team-item-caption">{{ 'Code Monkey & GTA Gamer' }}</p>
              <div class="team-item-links">
                <a
                  href="https://www.linkedin.com/in/steven-suh"
                  target="_blank"
                >
                  <img
                    class="team-item-links-img hover"
                    :src="linkedinImage"
                    alt="linkedin square"
                  />
                </a>
                <a href="https://github.com/stevensuh" target="_blank">
                  <img
                    class="team-item-links-img hover"
                    :src="githubImage"
                    alt="github"
                  />
                </a>
                <a href="https://stevensuh.me" target="_blank">
                  <img
                    class="team-item-links-img hover"
                    :src="heartImage"
                    alt="heart"
                  />
                </a>
              </div>
            </div>
          </div>
          <img class="snoo paddingTop large" :src="snooImage" alt="snoo" />
          <ButtonComponent
            class="team-start marginTop small"
            size="large"
            type="primary"
          >
            <router-link tag="a" to="/find"> Get Started </router-link>
          </ButtonComponent>
        </div>
        <img class="squiggles" :src="squigglesImage" alt="squiggles" />
        <img class="dots" :src="dotsImage" alt="dots" />
        <div class="paddingBottom small" />
      </div>
      <div class="footer paddingTop paddingBottom large">
        <div class="footer-items container">
          <a
            class="hover"
            href="https://github.com/stevensuh/vinegar"
            target="_blank"
          >
            GitHub Repo
          </a>
          <p>
            {{ 'Made with ' }}
            <span>
              <img class="footer-heart" :src="heartImage" alt="heart" />
            </span>
            {{ ' at Westside, Santa Cruz' }}
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import ButtonComponent from '@/components/button';
import Loader from '@/components/loader';
import { getSigninUrl } from '@/services/api';

import alarmClockImage from '@/assets/alarmClock.png';
import dotsImage from '@/assets/dots.png';
import exclamationImage from '@/assets/exclamation.png';
import findSessionImage from '@/assets/findSession.png';
import githubImage from '@/assets/github.png';
import heartImage from '@/assets/heart.png';
import jeffreImage from '@/assets/jeffre.png';
import leftImage from '@/assets/landing_left.png';
import linkedinImage from '@/assets/linkedin-square.png';
import lyanaImage from '@/assets/lyana.png';
import mugImage from '@/assets/mug.png';
import rightImage from '@/assets/landing_right.png';
import snooImage from '@/assets/snoo.png';
import squigglesImage from '@/assets/squiggles.png';
import steveImage from '@/assets/steve.png';

export default {
  name: 'IntroPage',
  components: {
    ButtonComponent,
    Loader,
  },
  data() {
    return {
      // state
      show: false,
      signinUrlLoaded: false,
      signinUrl: '',

      // img assets
      alarmClockImage,
      dotsImage,
      exclamationImage,
      findSessionImage,
      githubImage,
      jeffreImage,
      heartImage,
      leftImage,
      linkedinImage,
      lyanaImage,
      mugImage,
      rightImage,
      snooImage,
      squigglesImage,
      steveImage,
    };
  },
  async mounted() {
    await this.onInit();
    this.show = true;
  },
  methods: {
    async onInit() {
      const { signinUrl } = await getSigninUrl();

      this.signinUrl = signinUrl;
      this.signinUrlLoaded = true;
    },
    onClickAbout() {
      const { how } = this.$refs;
      const { top } = how.getBoundingClientRect();

      window.scrollTo({
        top,
        behavior: 'smooth',
      });
    },
  },
};
</script>

<style scoped>
.landing {
  display: flex;
  flex-direction: column;
  height: 96vh;
  overflow: hidden;
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
  position: absolute;
  width: auto;
}

.content > .left {
  left: 0;
  object-position: left;
}

.content > .right {
  object-position: right;
  right: 0;
  z-index: -1;
}

.content-message {
  margin: 0 auto;
  padding-top: 12%;
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

.how-header {
  color: var(--main-font-color);
  font-size: 36px;
  font-weight: 500;
  text-align: center;
}

.how-items {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
}

.how-item {
  width: 200px;
}

.how-item-icon-wrapper {
  background-color: var(--white-bg-color);
  border-radius: 50%;
  height: 150px;
  margin: auto;
  width: 150px;
}

.how-item-icon {
  object-fit: contain;
  height: 60%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: auto;
}

.how-item-caption,
.team-item-caption,
.team-item-name {
  font-size: 18px;
  line-height: 1.4em;
  text-align: center;
}

.how-start,
.team-start {
  display: block;
  margin: auto;
}

.team-header {
  font-size: 36px;
  font-weight: 500;
  text-align: center;
}

.team-items {
  align-items: flex-start;
  display: flex;
  justify-content: space-around;
}

.team-item {
  width: 230px;
}

.team-item-icon {
  object-fit: contain;
  width: 100%;
}

.team-item-name {
  color: var(--main-font-color);
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 10px;
}

.team-item-links {
  align-items: center;
  display: flex;
  justify-content: center;
}

.team-item-links-img {
  height: 30px;
  margin: 8px 6px;
  object-fit: contain;
  width: 30px;
}

.snoo {
  display: block;
  margin: auto;
  transform: translateX(16px);
  width: 203px;
}

.squiggles,
.dots {
  position: absolute;
}

.squiggles {
  left: 0;
  top: 0;
  transform: scale(0.4) translateY(-180px);
  transform-origin: 0 0;
}

.dots {
  bottom: 0;
  right: 0;
  transform: scale(0.35) translateY(-100px);
  transform-origin: 100% 100%;
}

.footer {
  background-color: var(--gray-bg-color);
  color: var(--gray-font-color);
  font-size: 16px;
}

.footer-items {
  align-content: center;
  display: flex;
  justify-content: space-between;
}

.footer-heart {
  height: 22px;
  object-fit: contain;
  vertical-align: bottom;
  width: 22px;
}

@media (max-width: 416px) {
  .landing {
    height: 73vh;
  }

  .nav-header {
    font-size: 32px;
  }

  .nav-header,
  .how-item {
    margin: auto;
  }

  .nav-items {
    display: none;
  }

  .content > .left {
    transform: scale(0.75) translateX(-20px);
    transform-origin: 0 100%;
  }

  .content > .right {
    transform: scale(0.75) translateX(30px);
    transform-origin: 100% 100%;
  }

  .content-header {
    font-size: 48px;
  }

  .content-p,
  .how-item-caption,
  .team-item-caption,
  .footer {
    font-size: 14px;
  }

  .how-header,
  .team-header {
    font-size: 28px;
  }

  .how-items,
  .team-items,
  .footer-items {
    flex-direction: column;
  }

  .how-items {
    margin-bottom: 30px;
    margin-top: 30px;
  }

  .how-item {
    width: 180px;
    margin: 30px auto;
  }

  .how-item-icon-wrapper {
    height: 120px;
    width: 120px;
  }

  .team-header {
    margin-bottom: 0;
  }

  .team-items {
    margin-top: 0;
  }

  .team-item {
    width: 200px;
    margin: 10px auto;
  }

  .team-item-name {
    font-size: 18px;
  }

  .squiggles,
  .dots {
    display: none;
  }

  .snoo {
    padding-top: 20px;
  }

  .footer-items {
    text-align: center;
  }

  .footer-items > p {
    margin-top: 20px;
  }

  .footer-heart {
    height: 20px;
    width: 20px;
  }
}
</style>
