import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Plus3 from '../views/Plus3.vue'
import WaterTakeNote from '../views/WaterTakeNote.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/plus3',
      name: 'plus3',
      component: Plus3,
    },
    {
      path: '/water',
      name: 'water',
      component: WaterTakeNote,
    },
  ],
})

export default router
