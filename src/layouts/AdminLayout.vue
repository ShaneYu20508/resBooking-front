<template lang="pug">
  //- 手機版側邊欄
  VNavigationDrawer(v-model="drawer" temporary location="left" v-if="isMobile")
    VList
      VListItem(:prepend-avatar :title="user.account")
    VDivider
    VList
      VListItem(
        v-for="item in navItems" :key="item.to"
        :to="item.to" :title="item.text" :prepend-icon="item.icon"
      )

  //- 電腦版側邊欄
  VNavigationDrawer(permanent v-if="!isMobile")
    VList
      VListItem(:prepend-avatar :title="user.account")
    VDivider
    VList
      VListItem(
        v-for="item in navItems" :key="item.to"
        :to="item.to" :title="item.text" :prepend-icon="item.icon"
      )

  //- 導覽列
  VAppBar(color="#008C45" v-if="isMobile" )
    VContainer.d-flex.align-center.w-100
      VBtn(to="/" :active="false")
        VAppBarTitle
          strong 義在家
      VSpacer
      //- 手機版導覽列
      template(v-if="isMobile")
        VAppBarNavIcon(@click="drawer = !drawer")

  //- 頁面內容
  VMain(style="min-height: calc(100vh)")
    RouterView(:key="$route.path")
</template>

<script setup>
import { useUserStore } from '@/store/user'
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'

const user = useUserStore()

// 判斷是否為手機
const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

// 控制側邊欄顯示與隱藏
const drawer = ref(false)

// 導覽列項目
const navItems = [
  { to: '/admin/reservations', text: '訂位管理', icon: 'mdi-list-box' },
  { to: '/admin/noshows', text: '訂位後未報到', icon: 'mdi-list-box' },
  { to: '/', text: '回首頁', icon: 'mdi-home' }
]

const prependAvatar = computed(() => {
  return `https://source.boringavatars.com/beam/120/${user.account}?colors=4EB3DE,8DE0A6,FCF09F,F27C7C,DE528C`
})
</script>
