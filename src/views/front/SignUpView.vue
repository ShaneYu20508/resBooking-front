<!-- eslint-disable semi -->
<template lang="pug">
  VCard.mx-auto.my-0.mt-5.my-sm-6.w-75(elevation="4" max-width="500")
    VTabs(v-model="tab" color="forth" align-tabs="center" fixed-tabs)
      VTab(:value="1" class="font-weight-black")
        VIcon mdi-login
        | 登入
      //- 不需要註冊頁面直接取消
      // VTab(:value="2" class="font-weight-black")
      //   VIcon mdi-account-plus-outline
      //   | 註冊
    VWindow(v-model="tab")
      VWindowItem(:value="1")
        VContainer(fluid)
          LoginView
      VWindowItem(:value="2")
        VContainer(fluid)
          RegisterView(@submit-form="shift")
</template>

<script setup>
import { ref } from 'vue'
import RegisterView from '@/components/RegisterView.vue'
import LoginView from '@/components/LoginView.vue'

const tab = ref(1)

const shift = () => {
  tab.value = 1
}

</script>
