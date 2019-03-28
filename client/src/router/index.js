import Vue from 'vue';
import Router from 'vue-router';

import landingPage from '@/views/landingPage';
import findPage from '@/views/findPage';
import sessionPage from '@/views/sessionPage';

import Decision from '@/views/findPage/decision';
import Join from '@/views/findPage/join';
import Create from '@/views/findPage/create';

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
      path: '/app',
      name: 'find',
      component: findPage,
      meta: { title: 'Vinegar - App' },
      children: [
        {
          path: 'find',
          component: Decision,
        },
        {
          path: 'join',
          component: Join,
        },
        {
          path: 'create',
          component: Create,
        },
        {
          path: '*',
          redirect: 'find',
        },
      ],
    },
    {
      path: '/app/session/:school/:session',
      name: 'session',
      component: sessionPage,
      meta: { title: 'Vinegar - :school/:session'},
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});

export default router;
