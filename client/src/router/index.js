import Vue from 'vue';
import Router from 'vue-router';

import landingPage from '@/views/landingPage';
import findPage from '@/views/findPage';
import sessionPage from '@/views/sessionPage';

Vue.use(Router);
export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'landing',
      component: landingPage,
    },
    {
      path: '/find',
      name: 'find',
      component: findPage,
    },
    {
      path: '/session/:school/:session',
      name: 'session',
      component: sessionPage,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
