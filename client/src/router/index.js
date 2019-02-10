import Vue from 'vue';
import Router from 'vue-router';

import landingPage from '@/views/landingPage';
import findPage from '@/views/findPage';
import sessionPage from '@/views/sessionPage';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'landing',
      component: landingPage,
      meta: { title: 'Vinegar' },
    },
    {
      path: '/app/find',
      name: 'find',
      component: findPage,
      meta: { title: 'Vinegar - App' },
    },
    {
      path: '/app/session/:school/:session',
      name: 'session',
      component: sessionPage,
      meta: { title: 'Vinegar - :school/:session'},
    },
    {
      path: '/app',
      redirect: '/app/find',
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});

export default router;
