<template lang="pug">
VContainer
  VRow
    VCol(cols="12")
      h1 訂位紀錄管理

    VCol(cols="12" md="3")
      VTextField(
        v-model="filterDate"
        label="篩選日期"
        type="date"
        @change="filterReservations")

    VCol(cols="12" md="1")
      VCheckbox(
        v-model="lunchTime"
        label="中午"
        @change="OnlyLunchChange"
      )

    VCol(cols="12" md="1")
      VCheckbox(
        v-model="dinnerTime"
        label="晚上"
        @change="OnlyDinnerChange"
      )

    VCol(cols="12" md="2")
      VCheckbox(
        v-model="onlyUnchecked"
        label="僅顯示未報到"
        @change="onOnlyUncheckedChange"
      )

    VCol(cols="12" md="2")
      VCheckbox(
        v-model="onlyCheckedIn"
        label="僅顯示已報到"
        @change="onOnlyCheckedInChange"
      )
  //-  顯示用餐總人數
  VRow
    VCol 中午總訂位人數：{{ lunchPeopleCount }}
    VCol.text-red 標記號碼有未到紀錄，請致電提醒
  VRow
    VCol 晚上總訂位人數：{{ dinnerPeopleCount }}
    //- 訂位資料
    VCol(cols="12")
      VDataTable(:items="reservations" :headers="headers" item-value="_id" item-key="_id")
        template(#[`item.phone`]="{ item }")
          span(:class="{ 'text-red': item.isWatched }") {{ item.phone }}
        template(#[`item.reservationDate`]="{ item }")
          | {{ formatDate(item.reservationDate) }}
        template(#[`item.checkIn`]="{ item }")
          VBtn(
            :color="item.noShow ? 'red' : (item.checkIn ? 'success' : 'grey')"
            size="small"
            :disabled="item.noShow || item.checkIn"
            @click="openDialog(item)"
          )
            | {{ item.noShow ? '已取消訂位' : (item.checkIn ? '已入座' : '報到') }}
        template(#[`item.noShow`]="{ item }")
          VBtn(
            :color="item.checkIn ? 'success' : (item.noShow ? 'red' : 'grey')"
            size="small"
            :disabled="item.noShow || item.checkIn"
            @click="openNoShowDialog(item)"
          )
            | {{ item.checkIn ? '顧客已報到' : (item.noShow ? '顧客未到' : '登記為未到') }}

//- 確認報到視窗
VDialog(v-model="dialog" max-width="400px")
  VCard
    VCardTitle 報到確認
    VCardText
      p 請確認以下資訊是否正確：
      p  姓名： {{ selectedItem?.name }}
      p  電話： {{ selectedItem?.phone }}
      p  人數： {{ selectedItem?.peopleCount }}
      p  日期： {{ formatDate(selectedItem?.reservationDate) }}
      p  時段： {{ selectedItem?.timePeriod }}
      p  時間： {{ selectedItem?.reservationTime }}
    VCardActions
      VSpacer
      VBtn(text @click="dialog = false") 取消
      VBtn(color="green" @click="confirmCheckIn") 確認報到

//- 取消訂位視窗
VDialog(v-model="noShowDialog" max-width="400")
  VCard
    VCardTitle.text-h6(style="font-weight: bold") 登記為未到嗎?
    VCardText
      p  確定要取消該訂位並列入觀察名單嗎？
      p  姓名： {{ selectedItem?.name }}
      p  電話： {{ selectedItem?.phone }}
      p  人數： {{ selectedItem?.peopleCount }}
      p  日期： {{ formatDate(selectedItem?.reservationDate) }}
      p  時段： {{ selectedItem?.timePeriod }}
      p  時間： {{ selectedItem?.reservationTime }}
    VCardActions
      VSpacer
      VBtn(text @click="noShowDialog = false") 關閉
      VBtn(color="red" @click="confirmCancel") 確定
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
const noShowDialog = ref(false) // ✅ 宣告 noShowDialog
const selectedItem = ref(null) // ✅ 宣告 selectedItem

const today = new Date().toLocaleDateString('sv-SE')
const filterDate = ref(today) // 預設為今天日期
const onlyUnchecked = ref(false)
const onlyCheckedIn = ref(false)
const lunchTime = ref(false)
const dinnerTime = ref(false)
const lunchPeopleCount = ref(0)
const dinnerPeopleCount = ref(0)

const headers = [
  { title: '姓名', key: 'name', minWidth: '100px' },
  { title: '電話', key: 'phone', minWidth: '120px' },
  { title: '用餐人數', key: 'peopleCount', minWidth: '70px' },
  { title: '用餐日期', key: 'reservationDate', minWidth: '140px' },
  { title: '時段', key: 'timePeriod', minWidth: '70px' },
  { title: '時間', key: 'reservationTime', minWidth: '80px' },
  { title: '報到狀態', key: 'checkIn', minWidth: '100px' },
  { title: '顧客未到', key: 'noShow', minWidth: '100px' }
]

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-TW')
}

const openDialog = (item) => {
  if (item.checkIn) return
  selectedItem.value = item
  dialog.value = true
}

const openNoShowDialog = (item) => {
  selectedItem.value = item
  noShowDialog.value = true
}

// 顧客已入座
const confirmCheckIn = async () => {
  const item = selectedItem.value
  if (!item || item.checkIn) return

  try {
    const { data } = await apiAuth.patch(`/reservations/${item._id}/checkIn`, {
      checkIn: true
    })
    item.checkIn = data.result.checkIn

    // 更新 allReservations 內對應項目
    const index = allReservations.value.findIndex(i => i._id === item._id)
    if (index !== -1) allReservations.value[index].checkIn = item.checkIn

    createSnackbar({
      text: '已標記為已報到',
      snackbarProps: { color: 'green' }
    })
    dialog.value = false
    filterReservations()
  } catch (error) {
    createSnackbar({
      text: '更新報到狀態失敗',
      snackbarProps: { color: 'red' }
    })
  }
}

// 顧客未到
const confirmCancel = async () => {
  const item = selectedItem.value
  if (!item) return

  try {
    const { data } = await apiAuth.patch(`/reservations/${item._id}/noShow`, {
      noShow: true
    })
    item.noShow = data.result.noShow // ✅ 更新畫面資料

    // 更新 allReservations 內對應項目
    const index = allReservations.value.findIndex(i => i._id === item._id)
    if (index !== -1) allReservations.value[index].noShow = item.noShow
    createSnackbar({
      text: '已取消訂位並標記為未到',
      snackbarProps: { color: 'green' }
    })
    noShowDialog.value = false
    filterReservations()
  } catch (error) {
    createSnackbar({
      text: '取消訂位失敗',
      snackbarProps: { color: 'red' }
    })
  }
}

// 篩選功能
const filterReservations = () => {
  const date = filterDate.value
  const showOnlyUnChecked = onlyUnchecked.value
  const showOnlyCheckedIn = onlyCheckedIn.value
  const showLunch = lunchTime.value
  const showDinner = dinnerTime.value

  const filtered = allReservations.value.filter(item => {
    // 比對日期（若有輸入篩選日期才比對）
    const itemDate = new Date(item.reservationDate).toLocaleDateString('zh-TW')
    const matchDate = date ? itemDate === new Date(date).toLocaleDateString('zh-TW') : true

    // 比對報到狀態
    let matchCheck = true
    if (showOnlyUnChecked || showOnlyCheckedIn) {
      // 若同時勾選「僅未報到」與「僅已報到」，視為全部顯示（不篩選）
      if (showOnlyUnChecked && showOnlyCheckedIn) {
        matchCheck = true
      } else if (showOnlyUnChecked && !item.checkIn) {
        matchCheck = true
      } else if (showOnlyCheckedIn && item.checkIn) {
        matchCheck = true
      } else {
        matchCheck = false
      }
    }

    // 比對時段（中午 / 晚上）
    let matchPeriod = true
    if (showLunch || showDinner) {
      // 若同時勾選兩個，則顯示全部（不篩選）
      if (showLunch && showDinner) {
        matchPeriod = true
      } else if (showLunch && item.timePeriod === '中午') {
        matchPeriod = true
      } else if (showDinner && item.timePeriod === '晚上') {
        matchPeriod = true
      } else {
        matchPeriod = false
      }
    }
    return matchDate && matchCheck && matchPeriod
  })
  // 最後才統計比較準確
  // 更新 reservations 為篩選後的結果
  reservations.value = filtered

  // 統計中午和晚上的人數
  lunchPeopleCount.value = 0
  dinnerPeopleCount.value = 0
  const selectedDate = new Date(filterDate.value).toLocaleDateString('zh-TW')

  for (const item of allReservations.value) {
    const itemDate = new Date(item.reservationDate).toLocaleDateString('zh-TW')
    if (itemDate === selectedDate) {
      if (item.timePeriod === '中午') {
        lunchPeopleCount.value += item.peopleCount
      } else if (item.timePeriod === '晚上') {
        dinnerPeopleCount.value += item.peopleCount
      }
    }
  }
}

// 切換 checkbox 行為
const onOnlyUncheckedChange = () => {
  if (onlyUnchecked.value) onlyCheckedIn.value = false
  filterReservations()
}

const onOnlyCheckedInChange = () => {
  if (onlyCheckedIn.value) onlyUnchecked.value = false
  filterReservations()
}

const OnlyLunchChange = () => {
  if (lunchTime.value) dinnerTime.value = false
  filterReservations()
}

const OnlyDinnerChange = () => {
  if (dinnerTime.value) lunchTime.value = false
  filterReservations()
}

// 初始化取得資料
onMounted(async () => {
  try {
    const { data } = await apiAuth.get('/reservations')
    // const { data } = await apiAuth.get('/reservations/notChecked')
    allReservations.value = data.result
    reservations.value = data.result
    filterReservations() // 初始化時也進行一次篩選
  } catch (error) {
    createSnackbar({
      text: '無法取得訂位資料',
      snackbarProps: { color: 'red' }
    })
  }
})
</script>
