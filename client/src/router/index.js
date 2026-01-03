import { createRouter, createWebHistory } from 'vue-router'
import { useGuessStore } from '@/stores/guessStore'

const routes = [
  {
    path: '/',
    name: 'Guess',
    component: () => import('@/views/GuessPage.vue'),
    meta: { title: '猜猜寶寶性別' }
  },
  {
    path: '/reveal',
    name: 'Reveal',
    component: () => import('@/views/RevealPage.vue'),
    meta: { title: '揭曉性別', requiresGuess: true }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/StatisticsPage.vue'),
    meta: { title: '統計結果' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守衛
router.beforeEach(async (to, from, next) => {
  // 設定頁面標題
  document.title = to.meta.title ? `${to.meta.title} | 寶寶性別揭露` : '寶寶性別揭露'

  const guessStore = useGuessStore()

  // 如果還沒檢查過猜測狀態，先檢查
  if (!guessStore.checked) {
    await guessStore.checkGuessStatus()
  }

  // 需要已猜測才能進入的頁面
  if (to.meta.requiresGuess && !guessStore.hasGuessed) {
    return next({ name: 'Guess' })
  }

  // 如果已經猜測過且已揭露，首頁直接跳轉到統計頁
  if (to.name === 'Guess' && guessStore.hasGuessed && guessStore.revealed) {
    return next({ name: 'Statistics' })
  }

  // 如果已經猜測過但未揭露，首頁跳轉到揭露頁
  if (to.name === 'Guess' && guessStore.hasGuessed && !guessStore.revealed) {
    return next({ name: 'Reveal' })
  }

  next()
})

export default router
