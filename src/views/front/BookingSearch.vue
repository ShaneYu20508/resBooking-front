<template lang="pug">
h1.bg-img 查詢訂位
VContainer
  VRow(justify="center")
    VCol(cols="12" md="6")
      VCard(class="pa-6 elevation-3")
        VCardTitle(class="text-h5 font-weight-bold mb-4") 請輸入電話號碼查詢
        VCardText
          VTextField(
            label="電話號碼"
            v-model="phone"
            type="tel"
            maxlength="10"
            prepend-icon="mdi-phone"
            variant="outlined"
            density="comfortable"
            :error-messages="phone.length !== 10 ? '請輸入 10 位數字電話號碼' : ''"
          )
          VBtn(
            color="primary"
            block
            class="mt-4"
            @click="searchReservation"
            :loading="loading"
          ) 查詢

//- 查詢結果區塊
VDialog(v-model="resultDialog" max-width="500" persistent)
  VRow(justify="center" class="mt-6")
    VCol(cols="12" md="8")
      template(v-if="reservation")
        VCard(ref="resultCardRef" class="pa-4 elevation-2")
          VCardTitle.text-h5 訂位資訊
          VCardText
            div.mb-2 姓名：{{ reservation.name }}
            div.mb-2 電話：{{ reservation.phone }}
            div.mb-2 人數：{{ reservation.peopleCount }}
            div.mb-2 日期：{{ formatDate(reservation.reservationDate) }}
            div.mb-2 時段：{{ reservation.timePeriod }}
            div.mb-2 時間：{{ reservation.reservationTime }}
            hr.my-4
            p.text-body-2.text-grey-darken-1 訂位將保留 15 分鐘，請準時到店用餐。
          VCardActions
            VSpacer
            VBtn(color="primary" @click="resultDialog = false") 確認
            VBtn(color="error" @click="dialog = true") 取消訂位

//- 查無資料對話框
VDialog(v-model="noResultDialog" max-width="400")
  VCard
    VCardTitle.text-h6 查無資料
    VCardText 查無此電話的訂位紀錄，請重新確認。
    VCardActions
      VSpacer
      VBtn(color="primary" @click="noResultDialog = false") 確認

//- 確認取消視窗
VDialog(v-model="dialog" max-width="400")
  VCard
    VCardTitle.text-h6(style="font-weight: bold") 確認取消
    VCardText 確定要取消此次訂位嗎？
    VCardActions
      VSpacer
      VBtn(color="primary" @click="dialog = false") 關閉
      VBtn(color="red" @click="confirmCancel") 取消訂位
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import gsap from 'gsap'

const { api } = useApi()
const createSnackbar = useSnackbar()

const phone = ref('')
const reservation = ref(null)
const searched = ref(false) // 是否已經搜尋過，這邊保留給你如果需要
const resultCardRef = ref(null) // 用於動畫的參考

const dialog = ref(false) // 控制確認對話框
const noResultDialog = ref(false) // 控制查無結果對話框
const resultDialog = ref(false) // 控制查詢結果對話框
const loading = ref(false) // 控制查詢按鈕的載入狀態

//  查詢訂位
const searchReservation = async () => {
  if (!/^\d{10}$/.test(phone.value)) {
    return
  }

  // 查詢前先關閉所有 dialog
  resultDialog.value = false
  noResultDialog.value = false
  dialog.value = false

  loading.value = true
  try {
    const { data } = await api.get(`/reservations/${phone.value}`)

    if (data.success && data.result) {
      reservation.value = data.result
      searched.value = true

      resultDialog.value = true // 顯示查詢結果對話框

      // 等畫面渲染完成後套用動畫
      await nextTick()
      if (resultCardRef.value?.$el) {
        gsap.from(resultCardRef.value.$el, {
          opacity: 0,
          y: 50,
          duration: 0.6,
          ease: 'power3.out'
        })
      }
    } else {
      // API 回傳成功但沒有資料
      reservation.value = null
      searched.value = true
      noResultDialog.value = true // 顯示查無結果對話框
      resultDialog.value = false
    }
  } catch (error) {
    // 錯誤時也顯示查無資料視窗
    reservation.value = null
    searched.value = true
    noResultDialog.value = true // 顯示查無結果對話框
  } finally {
    loading.value = false
  }
}

// 確認取消後執行刪除
const confirmCancel = async () => {
  dialog.value = false
  try {
    await api.delete(`/reservations/cancelByCustomer/${reservation.value._id}`)
    reservation.value = null
    createSnackbar({
      text: '已取消訂位',
      snackbarProps: { color: 'green' }
    })
  } catch (error) {
    createSnackbar({
      text: '取消失敗',
      snackbarProps: { color: 'red' }
    })
  }
  //  關閉所有對話框
  resultDialog.value = false
  noResultDialog.value = false
  dialog.value = false
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-TW')
}
</script>

<style lang="scss" scoped>
.bg-img {
  background-image: url('@/assets/booking-search-bigpic.jpg');
  background-size: cover;
  background-position: center;
  padding-left: 2%;
  height: 30vh;
  display: flex;
  align-items: center;
  color: white;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  @media (max-width: 1200px) {
    height: 30vh;
  }

  @media (max-width: 768px) {
    height: 10vh;
  }

  @media (max-width: 480px) {
    height: 10vh;
  }
}

.v-card {
  border-radius: 16px;
}

.v-btn {
  font-weight: bold;
  letter-spacing: 0.5px;
}

.v-alert {
  font-size: 1.1rem;
  padding: 16px;
}
</style>
