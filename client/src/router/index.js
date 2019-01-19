import Vue from 'vue'
import Router from 'vue-router'
import editor from '@/components/editor.vue'
import HelloWorld from '@/components/HelloWorld.vue' 

import introPage from '@/views/introPage.vue'
Vue.use(Router)
export default new Router({
  routes: [
    {
      path: '/home',
      name: 'HelloWorld',
      component: HelloWorld

    },
    {
        path: '/editor/:roomname',
        name: 'editor',
        component: editor
    },
    {
        path: '',
        name: "",
        component: introPage
    },

  ]
})
