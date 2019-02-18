<template>
  <transition name="fade">
    <div v-if="show">
      <div class="landing">
        <div class="container paddingTop">
          <nav class="navbar">
            <h2 class="nav-header">
              Vinegar
            </h2>
            <div class="nav-items">
              <ButtonComponent
                class="marginRight small hover"
                type="minimal"
              >
                <p @click="onClickAbout">
                  About
                </p>
              </ButtonComponent>
              <ButtonComponent type="primary">
                <router-link tag="a" to="/app/find">
                  Start
                </router-link>
              </ButtonComponent>
            </div>
          </nav>
        </div>
        <div class="content marginTop small">
          <img
            class="left"
            :src="leftImage"
            alt="landing asset left"
          />
          <div class="content-message">
            <h1 class="content-header">
              Divide and Conquer.
            </h1>
            <p class="content-p marginTop marginBottom">
              Take notes in a collaborative manner.
            </p>
            <ButtonComponent
              type="primary"
              size="large"
            >
              <router-link
                tag="a"
                to="/app/find"
              >
                Join Your Session
              </router-link>
            </ButtonComponent>
          </div>
          <img
            class="right"
            :src="rightImage"
            alt="landing asset right"
          />
        </div>
      </div>
      <div
        ref="how"
        class="section-how paddingTop paddingBottom small"
      >
        <div class="container paddingTop paddingBottom">
          <h2 class="how-header">
            How to Use
          </h2>
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
                <img
                  class="how-item-icon"
                  :src="mugImage"
                  alt="mug asset"
                />
              </div>
              <p class="how-item-caption marginTop small">
                Meanwhile, enjoy doing something else!
              </p>
            </div>
          </div>
          <ButtonComponent
            class="how-start"
            size="medium"
            type="primary"
          >
            <router-link
              tag="a"
              to="/app/find"
            >
              Get Started
            </router-link>
          </ButtonComponent>
        </div>
      </div>
      <div class="section-team paddingTop paddingBottom">
        <div class="container paddingTop paddingBottom">
          <h2 class="team-header marginBottom">
            The Team
          </h2>
          <div class="team-items marginBottom large">
            <div class="team-item">
              <img
                class="team-item-icon"
                :src="jeffreImage"
                alt="jeffre asset"
              />
              <p class="team-item-name">
                Jeffre
              </p>
              <p class="team-item-caption">
                {{ 'Skater & Bass Player' }}
              </p>
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
                <a
                  href="https://github.com/jeffreyyang3"
                  target="_blank"
                >
                  <img
                    class="team-item-links-img hover"
                    :src="githubImage"
                    alt="github"
                  />
                </a>
                <a
                  href="https://jeffreyyang3.github.io"
                  target="_blank"
                >
                  <img
                    class="team-item-links-img hover"
                    :src="heartImage"
                    alt="heart"
                  />
                </a>
              </div>
            </div>
            <div class="team-item">
              <img
                class="team-item-icon"
                :src="lyanaImage"
                alt="lyana asset"
              />
              <p class="team-item-name">
                Lyana
              </p>
              <p class="team-item-caption">
                {{ 'Dog & Roomba Lover' }}
              </p>
              <div class="team-item-links">
                <a
                  href="https://www.linkedin.com/in/lyanna-ho"
                  target="_blank"
                >
                  <img
                    class="team-item-links-img hover"
                    :src="linkedinImage"
                    alt="linkedin square"
                  />
                </a>
                <a
                  href="https://github.com/lyannerz"
                  target="_blank"
                >
                  <img
                    class="team-item-links-img hover"
                    :src="githubImage"
                    alt="github"
                  />
                </a>
                <a
                  href="https://lyannerz.github.io"
                  target="_blank"
                >
                  <img
                    class="team-item-links-img hover"
                    :src="heartImage"
                    alt="heart"
                  />
                </a>
              </div>
            </div>
            <div class="team-item">
              <img
                class="team-item-icon"
                :src="steveImage"
                alt="steve asset"
              />
              <p class="team-item-name">
                Steve
              </p>
              <p class="team-item-caption">
                {{ 'Code Monkey & GTA Gamer' }}
              </p>
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
                <a
                  href="https://github.com/stevensuh"
                  target="_blank"
                >
                  <img
                    class="team-item-links-img hover"
                    :src="githubImage"
                    alt="github"
                  />
                </a>
                <a
                  href="https://stevensuh.me"
                  target="_blank"
                >
                  <img
                    class="team-item-links-img hover"
                    :src="heartImage"
                    alt="heart"
                  />
                </a>
              </div>
            </div>
          </div>
          <img
            class="snoo paddingTop large"
            :src="snooImage"
            alt="snoo"
          />
          <ButtonComponent
            class="team-start marginTop small"
            size="large"
            type="primary"
          >
            <router-link
              tag="a"
              to="/app/find"
            >
              Get Started
            </router-link>
          </ButtonComponent>
        </div>
        <img
          class="squiggles"
          :src="squigglesImage"
          alt="squiggles"
        />
        <img
          class="dots"
          :src="dotsImage"
          alt="dots"
        />
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
              <img
                class="footer-heart"
                :src="heartImage"
                alt="heart"
              />
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

import '@/landing/style.css';

export default {
  name: 'IntroPage',
  components: {
    ButtonComponent,
  },
  data() {
    return {
      // state
      show: false,

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
  beforeCreate() {
    document.title = 'Vinegar';
  },
  mounted() {
    this.show = true;
  },
  methods: {
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
