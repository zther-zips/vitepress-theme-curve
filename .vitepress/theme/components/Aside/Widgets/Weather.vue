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

onMounted(async () => {
  try {
    // 1. 获取当前城市的 adcode
    const { adcode } = await getAdcode(import.meta.env.VITE_WEATHER_KEY)
    // 2. 拉取天气数据
    const { lives } = await getWeather(import.meta.env.VITE_WEATHER_KEY, adcode)
    weatherData.value = lives[0]
  } catch (e) {
    // 请确保你全局注册或引入了$message
    $message.error('获取天气失败，可能是天气 API 超出使用上限')
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



