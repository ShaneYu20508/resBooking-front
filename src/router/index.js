// Composables
import { createRouter, createWebHashHistory, START_LOCATION } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/',
    redirect: '/home',
    component: () => import('@/layouts/FrontLayout.vue'),
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/front/HomeView.vue'),
        meta: {
          title: 'Mi Casa',
          login: false,
          admin: false
        }
      },
      {
        path: 'news',
        name: 'News',
        component: () => import('@/views/front/NewsView.vue'),
        meta: {
          title: 'Mi Casa | 最新消息',
          login: false,
          admin: false
        }
      },
      {
        path: 'content',
        name: 'Content',
        component: () => import('@/views/front/ContentView.vue'),
        meta: {
          title: 'Mi Casa | 聯繫我們',
          login: false,
          admin: false
        }
      },
      {
        path: 'booking',
        name: 'Booking',
        component: () => import('@/views/front/BookingView.vue'),
        meta: {
          title: 'Mi Casa | 線上訂位',
          login: false,
          admin: false
        }
      },
      {
        path: 'booksearch',
        name: 'BookingSearch',
        component: () => import('@/views/front/BookingSearch.vue'),
        meta: {
          title: 'Mi Casa | 訂位查詢',
          login: false,
          admin: false
        }
      },
      {
        path: 'signup',
        name: 'Signup',
        component: () => import('@/views/front/SignUpView.vue'),
        meta: {
          title: 'Mi Casa | 管理員登入',
          login: false,
          admin: false
        }
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      {
        path: 'reservations',
        name: 'AdminReservations',
        component: () => import('@/views/admin/ReservationsView.vue'),
        meta: {
          title: 'Mi Casa | 訂位管理',
          login: true,
          admin: true
        }
      },
      {
        path: 'noshows',
        name: 'AdminNoShows',
        component: () => import('@/views/admin/NoShows.vue'),
        meta: {
          title: 'Mi Casa | 未報到管理',
          login: true,
          admin: true
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

// 設定路由的全域前置守衛
router.afterEach((to, from) => {
  document.title = to.meta.title
  // 每次路由變更後，將頁面滾動到頂部
  window.scrollTo(0, 0)
})

// 路由守衛
router.beforeEach(async (to, from, next) => {
  const user = useUserStore()

  if (from === START_LOCATION) {
    await user.getProfile()
  }

  if (user.isLogin && ['/signup'].includes(to.path)) {
    // 如果有登入，要去註冊或登入頁，重新導向回首頁
    next('/')
  } else if (to.meta.login && !user.isLogin) {
    // 如果要去的頁面要登入，但是沒登入，重新導向回登入頁
    next('/signup')
  } else if (to.meta.admin && !user.isAdmin) {
    // 如果要去的頁面要管理員，但是不是管理員，重新導向回首頁
    next('/')
  } else {
    // 不重新導向
    next()
  }
})

export default router
