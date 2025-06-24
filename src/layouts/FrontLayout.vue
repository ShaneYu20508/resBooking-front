<template lang="pug">
//- 手機版側欄
VNavigationDrawer(v-model="drawer" temporary location="left" v-if="isMobile")
  VList(nav)
    template(v-for="item in navItems" :key="item.to")
      VListItem(:to="item.to" v-if="item.show")
        template(#prepend)
          VIcon(:icon="item.icon")
        VListItemTitle {{ item.text }}
    VListItem(v-if="user.isLogin" @click="logout")
      template(#prepend)
        VIcon(icon="mdi-logout")
      VListItemTitle 登出
//- 導覽列
VAppBar.justify-center(style="height: 8vh;" color="#008C45")
  VContainer.d-flex.justify-space-between.align-center.w-75
    router-link(to="/home")
      img(src="@/assets/flag.png" alt="義在家" style="height: 11vh;object-fit: contain;")
    //- 手機版導覽列
    template(v-if="isMobile")
      VAppBarNavIcon(@click="drawer = true")
    //- 電腦版導覽列
    template(v-else)
      template(v-for="item in navItems" :key="item.to")
        VBtn(:to="item.to" :prepend-icon="item.icon" v-if="item.show") {{ item.text }}
      VBtn(prepend-icon="mdi-logout" v-if="user.isLogin" @click="logout") 登出
//- 頁面內容
VMain(style="min-height: calc(90vh); padding-top: 8vh")
  RouterView(:key="$route.path")
//- 頁腳
VFooter.bg-third.text-center(style="min-height:10vh; position: relative;")
  VRow.justify-center
    VCol(cols="12")
      strong ©{{ new Date().getFullYear() }} &nbsp; - &nbsp; 義在家 pasta straight home
      VBtn(
        v-for="icon in icons"
        :key="icon"
        class="ms-4"
        :icon="icon.name"
        :href="icon.link"
        target="_blank"
        variant="plain"
      )

  //- 右下角管理員連結
  router-link.text-white.text-decoration-none(
    :to = "user.isLogin ? '/admin/reservations' : '/signup'"
    style="position: absolute; bottom: 8px; right: 16px; font-size: 0.9rem;"
  ) 訂位管理
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useRouter } from 'vue-router'

const { apiAuth } = useApi()
const router = useRouter()
const createSnackbar = useSnackbar()
const user = useUserStore()

// 手機版判斷
const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

// 手機版惻欄開關
const drawer = ref(false)

// 導覽列項目
const navItems = computed(() => {
  return [
    { to: '/home', text: '關於我們', show: !user.isLogin || user.isLogin },
    { to: '/news', text: '最新消息', show: !user.isLogin || user.isLogin },
    { to: '/content', text: '聯繫我們', show: !user.isLogin || user.isLogin },
    { to: '/booking', text: '線上訂位', show: !user.isLogin || user.isLogin },
    { to: '/booksearch', text: '訂位查詢', show: !user.isLogin || user.isLogin },
    { to: '/admin/reservations', text: '管理', show: user.isLogin && user.isAdmin }
  ]
})

const logout = async () => {
  try {
    await apiAuth.delete('/users/logout')
    user.logout()
    createSnackbar({
      text: '登出成功',
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'green',
        location: 'bottom'
      }
    })
    router.push('/')
  } catch (error) {
    const text = error?.response?.data?.message || '發生錯誤，請稍後再試'
    createSnackbar({
      text,
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'red',
        location: 'bottom'
      }
    })
  }
}

const icons = ref([
  {
    name: 'mdi-facebook',
    link: 'https://www.facebook.com/'
  },
  {
    name: 'mdi-instagram',
    link: 'https://www.instagram.com'
  }
])
</script>

<style scoped lang="scss">
.bg-third{
  background-color:#CD212A;
  color:white
}

.v-btn{
  color: white;;
  font-size: 1.4rem;
}
</style>
