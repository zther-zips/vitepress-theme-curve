<template>
  <div v-if="type === 'text'" :class="['banner', bannerType]" id="main-banner">
    <h1 class="title">你好，欢迎来到{{ theme.siteMeta.title }}</h1>
    <div class="subtitle">
      <Transition name="fade" mode="out-in">
        <span :key="displayText" class="text" @click="toggleHitokoto">
          {{ displayText }}
        </span>
      </Transition>
    </div>
    <Transition name="fade" mode="out-in">
      <i v-if="height === 'full'" class="iconfont icon-up" @click="scrollToHome" />
    </Transition>
  </div>
  <div
    v-else-if="type === 'page'"
    :class="['banner-page', 's-card', { image }]"
    :style="{
      backgroundImage: image ? `url(${image})` : null,
    }"
  >
    <div class="top">
      <div class="title">
        <span class="title-small">{{ title }}</span>
        <span class="title-big">{{ desc }}</span>
      </div>
      <div class="top-right">
        <slot name="header-slot" />
      </div>
    </div>
    <slot />
    <div class="footer">
      <div class="footer-left">
        {{ footer }}
      </div>
      <div class="footer-right">
        <slot name="footer-slot" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { mainStore } from "@/store";
import { getHitokoto } from "@/api"; // 确保此路径正确，指向您获取一言的函数

const store = mainStore();
const { theme } = useData();
const props = defineProps({
  // 类型
  type: {
    type: String,
    default: "text",
  },
  // 高度
  height: {
    type: String,
    default: "half",
  },
  // 标题
  title: {
    type: String,
    default: "这里是标题",
  },
  // 简介
  desc: {
    type: String,
    default: "这里是简介",
  },
  // 注释
  footer: {
    type: String,
    default: "",
  },
  // 背景
  image: {
    type: String,
    default: "",
  },
});

const hitokotoData = ref(null);
const hitokotoInitialTimeout = ref(null); // 用于初次加载的定时器
const bannerType = ref(null);
// —— 新增：自动切换是否激活标志 —— 
const autoSwitchActive = ref(false)

// 初始时显示默认标语
const isHitokotoDisplayed = ref(false);
const defaultSlogan = theme.value.siteMeta.description;

// 用于跟踪是否是“第一次点击”一言以切换到默认标语
const isFirstClickAfterInitialHitokoto = ref(true);

const displayText = computed(() => {
  if (isHitokotoDisplayed.value && hitokotoData.value?.hitokoto) {
    return hitokotoData.value.hitokoto;
  } else {
    return defaultSlogan;
  }
});

// 获取一言数据
const getHitokotoData = async () => {
  try {
    const result = await getHitokoto();
    const { hitokoto, from, from_who } = result;
    hitokotoData.value = { hitokoto, from, from_who };
    isHitokotoDisplayed.value = true; // 获取成功后设置为显示一言
  } catch (error) {
    // $message.error("一言获取失败"); // 假设 $message 可用
    console.error("一言获取失败：", error);
    // 如果获取失败，仍然保持默认标语状态
    isHitokotoDisplayed.value = false; // 确保显示的是默认标语
  }
};
// —— 将自动切换逻辑拆分成单独函数，不清理定时器 —— 
async function autoToggleHitokoto() {
  if (isHitokotoDisplayed.value && !isFirstClickAfterInitialHitokoto.value) {
    // 隐藏一言，显示默认
    isHitokotoDisplayed.value = false
  } else {
    // 拉取新一言
    await getHitokotoData()
  }
}
// 点击切换
// 点击时：停止自动切换，并切回默认文案
const toggleHitokoto = async () => {
  if (autoSwitchActive.value) {
    // 停掉自动循环
    clearInterval(autoSwitchInterval.value)
    autoSwitchActive.value = false
    // 切回默认文案
    isHitokotoDisplayed.value = false
    return
  }
  // 只做手动切换（不再重启自动切换）
  if (isHitokotoDisplayed.value && !isFirstClickAfterInitialHitokoto.value) {
    isHitokotoDisplayed.value = false
  } else {
    await getHitokotoData()
  }
}

// 滚动至首页
const scrollToHome = () => {
  const bannerDom = document.getElementById("main-banner");
  if (!bannerDom) return false;
  scrollTo({
    top: bannerDom.offsetHeight,
    behavior: "smooth",
  });
};

watch(
  () => store.bannerType,
  (val) => {
    bannerType.value = val;
  },
);


// —— 新增 ——
// 自动切换的 interval 引用
const autoSwitchInterval = ref(null)

onMounted(() => {
  if (props.type === "text") {
    // 4 秒后首次拉取并显示一言
    hitokotoInitialTimeout.value = setTimeout(async () => {
      await getHitokotoData()
      // 拉取完成后启动自动切换
      autoSwitchInterval.value = setInterval(() => {
        autoToggleHitokoto()
      }, 7000)
      autoSwitchActive.value = true
    }, 4000)
  }
})

onBeforeUnmount(() => {
  // 清除初始加载的定时器，防止组件卸载后仍然执行
  if (hitokotoInitialTimeout.value) {
    clearTimeout(hitokotoInitialTimeout.value);
    clearInterval(autoSwitchInterval.value)
  }
});
</script>

<style lang="scss" scoped>
/* 样式保持不变 */
.banner {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fade-up 0.6s 0.1s backwards;
  transition: height 0.3s;
  &.full {
    opacity: 0;
    height: calc(100vh - 70px);
    padding-bottom: 100px;
    animation: fade-up 0.6s 0.5s forwards;
    .subtitle {
      opacity: 0;
      animation: fade-up-opacity 0.8s 0.5s forwards;
    }
  }
  .title {
    font-family: "Site Title";
    font-weight: bold;
    font-size: 2.75rem;
  }
  .subtitle {
    width: 80%;
    font-size: 1.25rem;
    opacity: 0.8;
    animation: fade-up-opacity 0.6s 0.1s backwards;
  .text {
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; // WebKit 引擎兼容性
    -webkit-box-orient: vertical; // WebKit 引擎兼容性

    line-clamp: 2; // 标准的 line-clamp 属性，提高兼容性
  }
}
  .icon-up {
    font-size: 20px;
    position: absolute;
    bottom: 60px;
    left: calc(50% - 10px);
    transform: rotate(180deg);
    animation: moveDown 2s ease-in-out infinite;
    cursor: pointer;
  }
  @media (max-width: 768px) {
    align-items: flex-start;
    height: 240px;
    .title {
      font-size: 2.25rem;
    }
    .subtitle {
      height: 50px;
      font-size: 1.125rem;
      margin-left: 8px;
      .text {
        text-align: left;
      }
    }
  }
}
.banner-page {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  min-height: 380px;
  background-size: cover;
  .top {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    .title {
      display: flex;
      flex-direction: column;
      .title-small {
        color: var(--main-font-second-color);
        font-size: 0.875rem;
      }
      .title-big {
        font-size: 2.25rem;
        font-weight: bold;
        line-height: 1.2;
        margin-top: 12px;
      }
    }
  }
  .footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    .footer-left {
      margin-top: auto;
      color: var(--main-font-second-color);
      opacity: 0.8;
    }
  }
  &.image {
    color: #fff !important;
    .top {
      .title-small {
        color: #fff;
        opacity: 0.6;
      }
    }
    .footer {
      .footer-left {
        color: #fff;
      }
      :deep(.iconfont) {
        color: #fff !important;
      }
    }
  }
  @media (max-width: 1200px) {
    min-height: 300px;
  }
  @media (max-width: 768px) {
    min-height: 260px;
    .top-right,
    .footer-right {
      display: none;
    }
  }
}
</style>