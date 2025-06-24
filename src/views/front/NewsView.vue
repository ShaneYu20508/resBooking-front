<template lang="pug">
h1.bg-img 最新消息
v-container.Vcon
  v-row.mt-5
    v-col.news-item.mb-8.px-8(
      v-for="(item, i) in news"
      :key="i"
      cols="12"
      md="6"
    )
      img.img(
        :src="item.image"
        :alt="`最新消息 ${i + 1}`"
        width="100%"
      )
      h2 {{ item.text1 }}
      v-divider.mb-6/
      p {{ item.text2 }}
      p {{ item.text3 }}
      p {{ item.text4 }}
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const news = ref([
  {
    image: new URL('@/assets/Carousel-1.jpg', import.meta.url).href,
    text1: '壽星我最大 壽星獨享經典套餐88折',
    text2: 'FROM 2025/01/01',
    text3: 'TO 2025/12/31',
    text4: '憑券內用消費獨享單客經典套餐88折，主餐升級加價亦適用，原價10%服務費另計。單筆消費每人每次限兌換乙份。'
  },
  {
    image: new URL('@/assets/Carousel-2.jpg', import.meta.url).href,
    text1: '新品推出，套餐95折優惠',
    text2: 'FROM 2025/05/01',
    text3: 'TO 2025/08/31',
    text4: '春季限定套餐推出，所有春季新品套餐享受95折優惠，數量有限，售完為止！'
  },
  {
    image: new URL('@/assets/Carousel-3.jpg', import.meta.url).href,
    text1: '全家聚餐優惠，四人同行三人付錢',
    text2: 'FROM 2025/04/01',
    text3: 'TO 2025/12/31',
    text4: '四人及以上同桌用餐，可享三人付費四人用餐優惠！憑此優惠券，第三位客人免單。'
  },
  {
    image: new URL('@/assets/marinara-spaghetti.jpg', import.meta.url).href,
    text1: '午餐時段專享套餐7折',
    text2: 'FROM 2025/01/01',
    text3: 'TO 2025/12/31',
    text4: '每週一至週五，上午11點至下午2點，所有午餐套餐均享受7折優惠，快來品嘗！'
  },
  {
    image: new URL('@/assets/Pesto-Spaghetti.jpg', import.meta.url).href,
    text1: '下午茶雙人套餐，第二份半價',
    text2: 'FROM 2025/01/01',
    text3: 'TO 2025/12/31',
    text4: '下午茶時間，兩人同時點選雙人套餐，第二份套餐享有50%折扣，快來共享悠閒午後！'
  },
  {
    image: new URL('@/assets/cream-spaghetti.jpg', import.meta.url).href,
    text1: '會員專享，首次註冊享99元優惠券',
    text2: 'FROM 2025/01/01',
    text3: '',
    text4: '新會員首次註冊即可獲得99元優惠券，享受全店消費折扣。使用優惠券時需滿100元消費。'
  }
])

onMounted(async () => {
  await nextTick() // 確保 DOM 元素已渲染完畢

  const items = document.querySelectorAll('.news-item')

  items.forEach((item) => {
    gsap.fromTo(item,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: item,
          start: 'top 60%',
          toggleActions: 'play none none none'
        }
      }
    )
  })
})
</script>

<style lang="scss" scoped>
.news-item {
  display: flex;
  flex-direction: column;
  height: 100%;
  opacity: 0;
  transform: translateY(50px);
}

.img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
  overflow: hidden;
  display: block;

  @media (max-width: 768px) {
    height: 150px;
  }
}

.Vcon {
  width: 75%;
  margin: 0 auto;

  @media (max-width: 768px) {
    width: 100%;
  }
}

.bg-img {
  background-image: url('@/assets/Carousel-4.jpg');
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
</style>
