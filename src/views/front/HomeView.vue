<template lang="pug">
//- 大標
div.title-img
  div.overlay
  div.text-wrapper
    h1.main-title(
      ref="mainTitle"
    ) Mi Casa, Su Casa — 我的家，也是你的家
    h2.subtitle(
      ref="subTitle"
    ) 「家的味道」不只是食物，<br>更是一種被接納與款待的溫度。

//- 理念
div.introduce.ma-auto.mt-10.d-flex.flex-column.align-center
  h2(
    ref="introTitle"
  ) 我們的理念
  v-divider.mb-6.mt-2.mx-auto.w-100
  VRow
    VCol(
      cols="12", sm="5"
      )
      img(
        src="@/assets/Carousel-1.jpg"
        alt="Restaurant Image"
        style="max-width: 100%; height: auto;"
        ref="introImg"
      )
    VCol(
      cols="12", sm="7"
    )
      p(
        ref="introText"
      ) 在「Mi Casa, Su Casa」，我們相信，家的味道，不只是食物的滋味，更是一種被理解與款待的溫度。我們希望，這裡不只是你來用餐的地方，而是一處能卸下壓力、安心落腳的角落。無論是熟悉的家常菜，還是我們精心調配的創意料理，每一道菜背後，都藏著我們對家的想像與心意。歡迎回家，這裡永遠為你留一個位置。

//- 菜單
div.menu.w-75.ma-auto.text-center.mt-10
  h1.ma-auto(
    ref="menuTitle"
  ) 餐廳菜單
    Carousel.menu-carousel.ma-auto.mt-10.mb-10(v-bind="config")
      Slide(v-for="(item, i) in items" :key="i")
        div.carousel__item
          img(
            @click="openDialog(item.src)"
            :src="item.src", alt="Menu image"
            ref="meunImg"
          )

      template(#addons)
        Navigation()
        Pagination()

  VDialog(v-model="dialog", max-width="90vw")
    VCard
      VCardText(style="padding: 0; background-color: black;")
        img(:src="selectedImage", style="width: 100%; height: auto; object-fit: contain;")
</template>

<script setup>
import { ref, onMounted } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import 'vue3-carousel/carousel.css'
import {
  Carousel,
  Slide,
  Pagination,
  Navigation
} from 'vue3-carousel'

gsap.registerPlugin(ScrollTrigger)

// 動畫
const mainTitle = ref(null)
const subTitle = ref(null)
const introTitle = ref(null)
const introImg = ref(null)
const introText = ref(null)
const menuTitle = ref(null)
const meunImg = ref(null)

onMounted(() => {
  // 主視覺動畫...
  const tl = gsap.timeline()
  tl.from(mainTitle.value, {
    opacity: 0,
    y: 50,
    duration: 1.7,
    ease: 'power3.out'
  }).from(subTitle.value, {
    opacity: 0,
    y: 50,
    duration: 1.7,
    ease: 'power3.out'
  }, '-=0.4')

  // 理念動畫
  gsap.timeline({
    scrollTrigger: {
      trigger: introImg.value,
      start: 'top 70%',
      toggleActions: 'play none none none'
    }
  })
    .from(introTitle.value, {
      opacity: 0,
      scale: 0.95,
      duration: 1,
      ease: 'power3.out'
    })
    .from(introImg.value, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.3')
    .from(introText.value, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.4')

  // 菜單動畫
  gsap.timeline({
    scrollTrigger: {
      trigger: menuTitle.value,
      start: 'top 90%',
      toggleActions: 'play none none none'
    }
  })
    .from(menuTitle.value, {
      opacity: 0,
      y: 50,
      duration: 1.5,
      ease: 'power3.out'
    })
    .from(meunImg.value, {
      opacity: 0,
      y: 30,
      duration: 1.2,
      ease: 'power3.out'
    }, '-=0.4')

  window.addEventListener('resize', () => {
    ScrollTrigger.refresh()
  })
})
// 菜單
const items = ref([
  {
    src: new URL('@/assets/menu1.png', import.meta.url).href
  },
  {
    src: new URL('@/assets/menu2.png', import.meta.url).href
  },
  {
    src: new URL('@/assets/menu3.png', import.meta.url).href
  },
  {
    src: new URL('@/assets/menu4.png', import.meta.url).href
  },
  {
    src: new URL('@/assets/menu5.png', import.meta.url).href
  }
])

const dialog = ref(false)
const selectedImage = ref('')

function openDialog (src) {
  selectedImage.value = src
  dialog.value = true
}

const config = {
  itemsToShow: 1,
  mouseWheel: false,
  wrapAround: true,
  autoplay: 4000,
  pauseAutoplayOnHover: true
}

</script>

<style scoped lang="scss">
// 標題區
.title-img {
  position: relative;
  background-image: url('@/assets/booking-bgpic.jpg');
  background-size: cover;
  background-position: center;
  height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: white;
  overflow: hidden;

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }

  .text-wrapper {
    position: relative;
    z-index: 2;
    padding-left: 15vw;

    .main-title {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .subtitle {
      font-size: 4rem;
      font-weight: bold;
      line-height: 1.3;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
  }

  @media (max-width: 768px) {
    .text-wrapper {
      padding-left: 8vw;

      .main-title {
        font-size: 1.8rem;
      }

      .subtitle {
        font-size: 2.5rem;
        line-height: 1.2;
      }
    }
  }

  @media (max-width: 480px) {
    .text-wrapper {
      padding-left: 5vw;

      .main-title {
        font-size: 1.7rem;
      }

      .subtitle {
        font-size: 1.9rem;
      }
    }
  }
}

// 理念區
.introduce h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
}

.introduce {
  max-width: 1200px;
  margin: 4rem auto;
  padding: 2rem;
  background-color: #fff;

  .v-row {
    align-items: center;

    img {
      border-radius: 1rem;
      max-width: 100%;
      height: auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    p {
      font-size: 1.125rem;
      line-height: 1.8;
      color: #555;
      padding: 0 1rem;

      br {
        display: none; // 在小螢幕隱藏 <br>
      }
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;

    h2 {
      font-size: 1.5rem;
    }

    p {
      font-size: 1rem;
      padding: 0;
    }

    .v-row {
      flex-direction: column;

      .v-col {
        text-align: center;
        margin-bottom: 1.5rem;
      }

      img {
        max-width: 90%;
      }
    }
  }
}

// 菜單區
.menu-carousel {
  .carousel__item {
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      max-width: 100%;
      max-height: 80vh;
      width: auto;
      height: auto;
      object-fit: contain;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      cursor: pointer;
    }
  }

  :deep(.carousel__pagination) {
    bottom: 5px;
  }
}
</style>
