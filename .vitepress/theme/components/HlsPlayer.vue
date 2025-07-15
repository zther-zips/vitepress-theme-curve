<template>
  <div ref="container">
    <video 
      ref="video" 
      :poster="poster" 
      controls 
      style="width: 100%; max-width: 800px; border-radius: 8px;"
      :autoplay="autoplay"
      :muted="muted"
      :loop="loop"
    ></video>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

// 组件参数
const props = defineProps({
  src: { type: String, required: true },       // 播放地址
  poster: { type: String, default: '' },       // 可选封面
  autoplay: { type: Boolean, default: false }, // 自动播放
  muted: { type: Boolean, default: false },    // 静音
  loop: { type: Boolean, default: false }      // 循环播放
})

const container = ref(null)
const video = ref(null)
let observer = null

// 缓存 Promise，避免多次加载 CDN
let hlsJsLoader = null
function loadHlsJsOnce() {
  if (window.Hls) return Promise.resolve(window.Hls)
  if (hlsJsLoader) return hlsJsLoader

  hlsJsLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdmirror.com/npm/hls.js@latest'
    script.onload = () => resolve(window.Hls)
    script.onerror = reject
    document.head.appendChild(script)
  })

  return hlsJsLoader
}

async function initPlayer() {
  if (!video.value) return

  const url = props.src

  // 设置静音/循环属性
  video.value.muted = props.muted
  video.value.loop = props.loop

  // Safari 原生支持 m3u8
  if (video.value.canPlayType('application/vnd.apple.mpegurl')) {
    video.value.src = url
  } else {
    const Hls = await loadHlsJsOnce()
    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(url)
      hls.attachMedia(video.value)
    } else {
      console.warn('当前浏览器不支持 HLS.js')
    }
  }

  // 自动播放
  if (props.autoplay) {
    video.value.play().catch(() => {
      console.log('⚠️ 自动播放被浏览器阻止，需要用户交互')
    })
  }
}

onMounted(() => {
  // IntersectionObserver 懒加载：视频进入视口才初始化
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        initPlayer()
        observer.disconnect() // 初始化后停止监听
        break
      }
    }
  }, {
    rootMargin: '100px' // 提前100px加载
  })

  if (container.value) {
    observer.observe(container.value)
  }
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>
