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
import { ref, onMounted } from 'vue'
import { getAdcode, getWeather } from '@/api'

const weatherData = ref(null)

// 移动端检测：若是移动端，则不请求，直接显示“--”
// const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
// 函数：判断当前是否“窄屏” (如 ≤768px 视为移动端)
function isMobileByWidth() {
  return window.innerWidth <= 768;
}

// 初次渲染或调用时：
let isMobile = isMobileByWidth();
if (isMobile) {
  // 移动端：不请求，直接显示 “--”
  showPlaceholder();
} else {
  // 非移动端：正常发请求
  fetchDataAndRender();
}

// 可选：监听窗口尺寸变化，实时切换
window.addEventListener('resize', () => {
  const nowMobile = isMobileByWidth();
  if (nowMobile !== isMobile) {
    isMobile = nowMobile;
    if (isMobile) {
      showPlaceholder();
    } else {
      fetchDataAndRender();
    }
  }
});

// 示例中的两个函数，你可以这样实现：
function showPlaceholder() {
  document.getElementById('your-element').textContent = '--';
}
function fetchDataAndRender() {
  // 发请求、渲染数据的逻辑…
}
onMounted(async () => {
  if (isMobile) return
  try {
    const { adcode } = await getAdcode(import.meta.env.VITE_WEATHER_KEY)
    const { lives } = await getWeather(import.meta.env.VITE_WEATHER_KEY, adcode)
    weatherData.value = lives[0]
  } catch (e) {
    console.error('获取天气失败：', e)
    $message.error("获取天气失败，可能是天气API超出使用上限");
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



