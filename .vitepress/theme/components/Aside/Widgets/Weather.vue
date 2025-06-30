<!-- 侧边栏 - 天气数据 -->
<template>
  <div class="weather-data s-card">
    <div class="title">
      <i class="iconfont icon-chart"></i>
      <span class="title-name">天气数据</span>
    </div>

    <div class="all-data">
      <!-- 城市 -->
      <div class="data-item">
        <span class="name"><i class="iconfont icon-home"></i> 城市</span>
        <span class="num">{{ weatherData?.city || '--' }}</span>
      </div>
      <!-- 温度 -->
      <div class="data-item">
        <span class="name"><i class="iconfont icon-fire"></i> 温度</span>
        <span class="num">
          {{ weatherData?.temperature != null ? weatherData.temperature + '℃' : '--' }}
        </span>
      </div>
      <!-- 湿度 -->
      <div class="data-item">
        <span class="name"><i class="iconfont icon-visibility"></i> 湿度</span>
        <span class="num">
          {{ weatherData?.humidity != null ? weatherData.humidity + '%' : '--' }}
        </span>
      </div>
      <!-- 风向 -->
      <div class="data-item">
        <span class="name"><i class="iconfont icon-arrow-right"></i> 风向</span>
        <span class="num">{{ weatherData?.winddirection || '--' }}</span>
      </div>
      <!-- 风力 -->
      <div class="data-item">
        <span class="name"><i class="iconfont icon-refresh"></i> 风力</span>
        <span class="num">{{ weatherData?.windpower || '--' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getAdcode, getWeather } from '@/api'

const weatherData = ref(null)
// 响应式记录当前窗口宽度
const windowWidth = ref(window.innerWidth)
// 大于 768px 时认为是“桌面端”
const isDesktop = computed(() => windowWidth.value > 768)

// 真正去拉接口的函数
async function fetchWeather() {
  try {
    const { adcode } = await getAdcode(import.meta.env.VITE_WEATHER_KEY)
    const { lives } = await getWeather(import.meta.env.VITE_WEATHER_KEY, adcode)
    weatherData.value = lives[0]
  } catch (e) {
    $message.error('获取天气失败：', e)
    // 根据项目使用的 UI 框架，这里可以用 $message.error(...)
  }
}

onMounted(() => {
  // 初次挂载：若是桌面端，则立即拉取
  if (isDesktop.value) {
    fetchWeather()
  }
  // 监听窗口尺寸变化
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth
  })
})

// 当从“窄屏”切换到“宽屏”时，再次拉接口；切回窄屏则清空数据
watch(isDesktop, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    fetchWeather()
  }
  if (!newVal) {
    weatherData.value = null
  }
})
</script>

<style lang="scss" scoped>
.weather-data {
  .all-data {
    display: flex;
    flex-direction: column;
    margin-top: 12px;

    .data-item {
      width: 100%;
      padding: 8px 0;
      display: flex;
      justify-content: space-between;

      .name {
        font-weight: 500;
        display: flex;
        align-items: center;
        i {
          margin-right: 4px;
        }
      }

      .num {
        font-size: 1.1em;
      }
    }
  }
}
</style>



