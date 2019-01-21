import Vue from 'vue';
import Router from 'vue-router';

import landingPage from '@/views/landingPage.vue';
import findPage from '@/views/findPage.vue';
import sessionPage from '@/views/sessionPage.vue';

Vue.use(Router);
export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: "landing",
      component: landingPage,
    },
    {
      path: '/find',
      name: 'find',
      component: findPage,
    },
    {
      path: '/session/:roomname',
      name: 'session',
      component: sessionPage,
    },
    {
      path: '*',
      redirect: '/',
    }
  ],
})
