import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
  base: '/',
  mode: 'history',
  routes: [
    {
      name: 'home',
      path: '/user/:user/shelf/:shelf/:order?',
      component: () => import('@/components/views/home'),
    },
    {
      path: '*',
      redirect: { path: 'user/1/shelf/readed' }
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})
