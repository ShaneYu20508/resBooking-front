<template lang="pug">
h1.bg-img 線上訂位
VContainer.Vcon
  VRow.mt-5
    VCol(cols="12")
      VForm(:disabled="isSubmitting" @submit.prevent="submit")
        VRow
          VCol(cols="12" md="3")
            VTextField(
              label="用餐人數"
              type="number" min="1"
              v-model.number="peopleCount.value.value"
              :error-messages="peopleCount.errorMessage.value"
            )
          VCol(cols="12" md="3")
            VTextField(
              label="姓名"
              v-model="name.value.value"
              :error-messages="name.errorMessage.value"
            )
          VCol(cols="12" md="6")
            VTextField(
              label="電話" type="tel" maxlength="10"
              v-model="phone.value.value"
              :error-messages="phone.errorMessage.value"
            )
        VRow
          VCol(cols="12" md="6")
            VMenu(
              v-model="isMenuOpen"
              :close-on-content-click="false")
              template(#activator="{ props }")
                VTextField(
                  v-bind="props"
                  label="訂位日期"
                  variant="outlined"
                  prepend-inner-icon="mdi-calendar-range"
                  :model-value="selectedDate"
                  :error-messages="reservationDate.errorMessage.value"
                  readonly
                )
              VDatePicker(
                v-model="reservationDate.value.value"
                :min="minDate"
                :max="maxDate"
                @update:model-value="isMenuOpen = false"
              )
          VCol(cols="12" md="3")
            VSelect(
              label="時段" :items="whens"
              v-model="timePeriod.value.value"
              :error-messages="timePeriod.errorMessage.value"
            )
            div.text-caption.text-red.mt-1
              template(v-if="availableSeats === null")
                VProgressCircular(indeterminate color="primary" size="20")
                span.ml-2 查詢中...
              template(v-else)
                span 剩餘可訂位人數：{{ maxSeats - availableSeats }} / {{ maxSeats }} 人
          VCol(cols="12" md="3")
            VSelect(
              label="訂位時間" :items="filteredTimes"
              v-model="reservationTime.value.value"
              :error-messages="reservationTime.errorMessage.value"
            )
        VBtn(color="primary" type="submit") 提交訂位

VDialog(v-model="dialog" max-width="500px")
  VCard
    VCardTitle.text-h6 訂位資料確認
    VCardText
      p.mb-2 請確認以下資訊是否正確：
      p 姓名： {{ confirmData.name }}
      p 電話： {{ confirmData.phone }}
      p 人數： {{ confirmData.peopleCount }}
      p 日期： {{ formatDate(confirmData.reservationDate) }}
      p 時段： {{ confirmData.timePeriod }}
      p 時間： {{ confirmData.reservationTime }}
      hr.my-4
      p.text-body-2.text-grey-darken-1 訂位將保留 15 分鐘，請準時到店用餐。
    VCardActions
      VSpacer
      VBtn(text @click="dialog = false") 取消
      VBtn(color="primary" @click="confirmReservation") 確認送出
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useSnackbar } from 'vuetify-use-dialog'
import { useApi } from '@/composables/axios'

// API composable
const { api } = useApi()

// Snackbar for feedback messages
const createSnackbar = useSnackbar()

// 可選擇的時段選項
const whens = ['中午', '晚上']

// 中午與晚上的時間選項
const lunchTimes = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30']
const dinnerTimes = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30']

// 計算日期範圍：從明天開始到當年 12/31
const today = new Date()
const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
const minDate = tomorrow.toISOString().split('T')[0]
const maxDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0]

// 剩餘空位
const maxSeats = 40 // 假設每個時段最多可訂 40 人
const availableSeats = ref(null)

// 初始化表單
const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: yup.object({
    name: yup.string().required('姓名為必填欄位'),
    phone: yup.string().required('電話為必填欄位').matches(/^\d{10}$/, '電話格式錯誤，請輸入 10 位數字'),
    peopleCount: yup
      .number()
      // 在 VTextField 使用 v-model="peopleCount.value.value" 時，
      // 輸入框的值是字串（""），但 VeeValidate 的 schema 中設定 peopleCount 必須是 number，
      // yup 嘗試轉換空字串成數字時會變成 NaN，所以出現錯誤：
      // "peopleCount must be a `number` type, but the final value was: `NaN`."

      // 加上下面這行這樣 yup 在遇到 "" 時就會轉為 undefined，然後觸發 required 錯誤，而不是 NaN 錯誤。
      .transform((value, originalValue) => {
        return originalValue === '' ? undefined : value
      })
      .required('用餐人數為必填欄位')
      .min(1, '用餐人數至少為 1 人')
      .max(20, '用餐人數最多為 20 人'),
    reservationDate: yup
      .date()
      .required('訂位日期為必填欄位')
      .min(tomorrow, '訂位日期不能早於今天'),
    timePeriod: yup
      .string()
      .required('時段為必填欄位')
      .oneOf(whens),
    reservationTime: yup
      .string()
      .required('訂位時間為必填欄位')
      .when('timePeriod', ([time], schema) => {
        return time === '中午'
          ? schema.oneOf(lunchTimes, '請選擇中午的用餐時間')
          : schema.oneOf(dinnerTimes, '請選擇晚上的用餐時間')
      })
  }),
  initialValues: {
    name: '王曉明',
    phone: '0912345678',
    peopleCount: 1,
    reservationDate: tomorrow,
    timePeriod: '中午',
    reservationTime: '12:00'
  }
})

// 各欄位欄位綁定（vee-validate）
const name = useField('name')
const phone = useField('phone')
const peopleCount = useField('peopleCount')
const reservationDate = useField('reservationDate')
const timePeriod = useField('timePeriod')
const reservationTime = useField('reservationTime')

// 當時段變更時，觸發時間驗證
watch(() => timePeriod.value.value, () => {
  reservationTime.validate()
})

// 根據選擇的時段回傳對應時間選項
const filteredTimes = computed(() => {
  return timePeriod.value.value === '中午' ? lunchTimes : dinnerTimes
})

// 顯示於輸入框中的選擇日期格式化
const selectedDate = computed(() => {
  const date = reservationDate.value.value
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

// 控制日期選單是否開啟
const isMenuOpen = ref(false)

// 控制確認彈窗是否開啟
const dialog = ref(false)

// 用來保存確認資料內容
const confirmData = ref({})

// 日期格式化函式
const formatDate = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 當日期或時段改變時，重新取得剩餘人數
watch([() => reservationDate.value.value, () => timePeriod.value.value], async () => {
  await fetchAvailability()
})

// 取得剩餘可預約人數
onMounted(() => {
  fetchAvailability()
})
const fetchAvailability = async () => {
  const date = reservationDate.value.value
  const period = timePeriod.value.value
  availableSeats.value = null // 可搭配 loading spinner 使用

  if (!date || !period) return

  const formattedDate = new Date(date).toISOString().split('T')[0]
  try {
    const { data } = await api.get('/reservations/summary', {
      params: {
        date: formattedDate,
        period
      }
    })
    availableSeats.value = data.total // 👈 已用掉的人數
  } catch (error) {
    availableSeats.value = null
    console.error('取得剩餘人數失敗', error)
  }
}

// 送出表單，先暫存並打開確認對話框
const submit = handleSubmit((values) => {
  confirmData.value = { ...values }
  dialog.value = true
})

// 確認送出表單的資料至後端 API
const confirmReservation = async () => {
  try {
    const values = confirmData.value
    await api.post('/reservations', {
      name: values.name,
      phone: values.phone,
      peopleCount: values.peopleCount,
      reservationDate: values.reservationDate,
      reservationTime: values.reservationTime,
      timePeriod: values.timePeriod
    })

    createSnackbar({
      text: '訂位成功！',
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'green',
        location: 'bottom'
      }
    })
    dialog.value = false
    resetForm()
  } catch (error) {
    const text = error?.response?.data?.message || '訂位失敗，請稍後再試'
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
</script>

<style lang="scss" scoped>
.Vcon {
  width: 50%;
  margin: 0 auto;

  @media (max-width: 768px) {
    width: 100%;
  }
}

.bg-img {
  background-image: url('@/assets/booking-bgpic.jpg');
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

.v-form {
  margin-top: 2rem;
}

.v-text-field {
  margin-bottom: 1rem;
}
</style>
