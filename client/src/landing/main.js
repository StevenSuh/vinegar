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

import 'web-animations-js';

import '@/style.css';
import './style.css';

const images = {
  alarmClockImage,
  dotsImage,
  exclamationImage,
  findSessionImage,
  githubImage,
  githubImage1: githubImage,
  githubImage2: githubImage,
  heartImage,
  heartImage1: heartImage,
  heartImage2: heartImage,
  heartImage3: heartImage,
  jeffreImage,
  leftImage,
  linkedinImage,
  linkedinImage1: linkedinImage,
  linkedinImage2: linkedinImage,
  lyanaImage,
  mugImage,
  rightImage,
  snooImage,
  squigglesImage,
  steveImage,
};

const landingImages = {
  leftImage,
  rightImage,
};

async function init() {
  Object.entries(images).forEach(([key, value]) => {
    const img = document.getElementById(key);
    img.src = value;
  });
  Object.entries(landingImages).forEach(([key, value]) => {
    const img = document.getElementById(key);
    img.src = value;
    img.onload = () => {
      delete landingImages[key];

      if (Object.keys(landingImages).length === 0) {
        document.getElementById('content').classList.add('show');
      }
    };
  });

  const loader = document.getElementById('loader');
  const loaderAnim = loader.animate(
    [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' },
    ],
    { duration: 500, iterations: Infinity },
  );

  document.getElementById('about').onclick = () => {
    const how = document.getElementById('how');
    const { top } = how.getBoundingClientRect();

    window.scrollTo({
      top,
      behavior: 'smooth',
    });
  };

  const { signinUrl } = await getSigninUrl();
  const login = document.getElementById('login');
  login.href = signinUrl;
  loader.classList.add('hide');
  login.classList.add('show');
  loaderAnim.cancel();
}

window.onload = init;
