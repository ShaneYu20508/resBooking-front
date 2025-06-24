<template lang="pug">
VCard.product-card
  div.overflow-hidden(style="margin-bottom: 10px;")
    RouterLink.text-decoration-none(:to="'/products/' + _id")
      VImg.img-enlarge(:src="image" cover width="100%" height="300")
  div(style="background-color: white; padding: 5px;")
    VForm(
      :disabled="isSubmitting"
      @submit.prevent="submit"
    )
      VCardTitle
        RouterLink.text-primary.text-decoration-none(:to="'/products/' + _id") {{ name }}
      VCardSubtitle ${{ price }}
      VSelect(
        label="麵條種類" :items="noodles"
        v-model = "noodle.value.value"
        :error-messages="noodle.errorMessage.value"
      )
      VTextField(
        type="number" min="1"
        v-model.number="quantity.value.value"
        variant="outlined"
        placeholder="數量"
      )
      VBtn(
        type="submit"
        color="primary"
        prepend-icon="mdi-cart"
        :loading="isSubmitting"
        style="width:100%; height: 50px;"
      ) 加入購物車
</template>

<script setup>
// 自己加的===========
import { ref, onMounted } from 'vue'
// ===================
import { useApi } from '@/composables/axios'
// 換掉原本預設的購物車值，原本設定為0
import { useUserStore } from '@/store/user'
import { useSnackbar } from 'vuetify-use-dialog'
import { useRouter } from 'vue-router'
// 自己加的===========
// import { useRoute } from 'vue-router'
import { useForm, useField } from 'vee-validate'
// ===================

const { api, apiAuth } = useApi()
const user = useUserStore()
const createSnackbar = useSnackbar()
const router = useRouter()

// 自己加
// const route = useRoute()
// =============

// 有哪些接收的資料
const props = defineProps(['_id', 'category', 'description', 'images', 'name', 'price', 'sell'])

const noodles = ['直麵', '筆管麵', '寬扁麵']

// 自己做的加入購物車
const product = ref({
  _id: '',
  name: '',
  price: 0,
  description: '',
  images: [],
  sell: true,
  category: ''
})

const { isSubmitting, handleSubmit } = useForm({
  initialValues: {
    quantity: 1,
    noodle: '直麵'
  }
})
const quantity = useField('quantity')
const noodle = useField('noodle')

const submit = handleSubmit(async (values) => {
// console.log('Noodle:', values.noodle)

  if (!user.isLogin) {
    createSnackbar({
      text: '請先登入再加入購物車',
      showCloseButton: false,
      snackbarProps: {
        timeout: 1000,
        color: 'red',
        location: 'bottom'
      }
    })
    router.push('/signup')
    return
  }
  try {
    const { data } = await apiAuth.patch('/users/cart', {
      product: props._id,
      quantity: values.quantity,
      noodle: values.noodle
    })

    user.cart = data.result

    createSnackbar({
      text: '新增成功',
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'green',
        location: 'bottom'
      }
    })
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
})

onMounted(async () => {
  // console.log('Product props:', props)
  try {
    const { data } = await api.get('/products/')
    product.value._id = data.result._id
    product.value.name = data.result.name
    product.value.price = data.result.price
    product.value.images = data.result.images
    product.value.description = data.result.description
    product.value.category = data.result.category
    product.value.sell = data.result.sell
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
    router.push('/')
  }
})
</script>
