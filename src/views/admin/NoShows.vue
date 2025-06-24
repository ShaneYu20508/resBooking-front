<template lang="pug">
VContainer
  VRow
    VCol(cols="12")
      h1 未到紀錄

    VCol(cols="12")
      VDataTable(:items="reservations" :headers="headers" item-value="_id")
        template(#[`item.phone`]="{ item }")
          span.text-red {{ item.phone }}
        template(#[`item.reservationDate`]="{ item }")
          | {{ formatDate(item.reservationDate) }}
        template(#[`item.actions`]="{ item }")
          VBtn(
            color="red" @click="openDialog(item)"
          ) 刪除

  // 刪除確認視窗
  VDialog(v-model="dialog" max-width="400px")
    VCard
      VCardTitle.text-h6(style="font-weight: bold") 確認刪除
      VCardText
        p 確定要刪除此筆未到的訂位資料嗎？
        p 姓名：{{ selectedItem?.name }}
        p 電話：{{ selectedItem?.phone }}
      VCardActions
        VSpacer
        VBtn(text @click="dialog = false") 關閉
        VBtn(color="red" @click="deleteReservation") 確定刪除
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const allReservations = ref([])
const reservations = ref([])
const dialog = ref(false)
const selectedItem = ref(null) // ✅ 宣告 selectedItem

const headers = [
  { title: '姓名', key: 'name', minWidth: '100px' },
  { title: '電話', key: 'phone', minWidth: '120px' },
  { title: '訂位人數', key: 'peopleCount', minWidth: '70px' },
  { title: '訂位日期', key: 'reservationDate', minWidth: '140px' },
  { title: '時段', key: 'timePeriod', minWidth: '70px' },
  { title: '時間', key: 'reservationTime', minWidth: '80px' },
  { title: '操作', key: 'actions', sortable: false }]

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-TW')
}

const openDialog = (item) => {
  selectedItem.value = item
  dialog.value = true
}

//  刪除該筆未到資料
const deleteReservation = async () => {
  try {
    await apiAuth.delete(`/reservations/cancelByCustomer/${selectedItem.value._id}`)

    // 從資料中移除
    allReservations.value = allReservations.value.filter(r => r._id !== selectedItem.value._id)
    reservations.value = reservations.value.filter(r => r._id !== selectedItem.value._id)

    createSnackbar({
      text: '訂位已成功刪除',
      snackbarProps: { color: 'green' }
    })
  } catch (error) {
    createSnackbar({
      text: '刪除失敗',
      snackbarProps: { color: 'red' }
    })
  } finally {
    dialog.value = false
  }
}

// 初始化取得資料
onMounted(async () => {
  try {
    const { data } = await apiAuth.get('/reservations/noShow')
    allReservations.value = data.result
    reservations.value = data.result
  } catch (error) {
    createSnackbar({
      text: '無法取得訂位資料',
      snackbarProps: { color: 'red' }
    })
  }
})
</script>
