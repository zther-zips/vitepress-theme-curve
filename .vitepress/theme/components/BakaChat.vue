<script setup>
import { ref, computed } from "vue"
import { useData } from "vitepress"
import { sendToBaka } from "@/api/index.js"  // 引入 API 函数

// 读取主题配置
const { theme } = useData()
const bakaConfig = computed(() => theme.value?.bakaChat || { enable: false })

// 如果禁用了，直接不渲染
const isEnabled = computed(() => bakaConfig.value.enable !== false)

const open = ref(false)
const input = ref("")
const loading = ref(false)
const messages = ref([
  { role: "assistant", content: "喵～咱是baka，窝在你的小窝里了w" }
])

const scrollToBottom = async () => {
  await nextTick()
  const el = document.querySelector(".baka-messages")
  if (el) el.scrollTop = el.scrollHeight
}

async function sendMessage() {
  const text = input.value.trim()
  if (!text) return
  const userMessage = { role: "user", content: text }
  messages.value.push(userMessage)
  input.value = ""
  await scrollToBottom()

  loading.value = true
  try {
    // 直接传当前消息数组（不重复附加）
    const data = await sendToBaka([...messages.value])
    messages.value.push({ role: "assistant", content: data.reply })
  } catch (e) {
    console.error(e)
    messages.value.push({ role: "assistant", content: "呜，baka出错了喵…" })
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}
</script>

<template>
  <div v-if="isEnabled">
    <!-- 按钮 -->
    <button
      class="baka-btn"
      @click="open = !open"
    >
      🐾 喵
    </button>

    <!-- 聊天抽屉 -->
    <div v-if="open" class="baka-drawer">
      <div class="baka-messages">
        <div
          v-for="(m, i) in messages"
          :key="i"
          :class="m.role"
        >
          <b v-if="m.role === 'user'">你：</b>
          <b v-else>baka：</b>
          <span>{{ m.content }}</span>
        </div>
      </div>
      <div class="baka-input">
        <input
          v-model="input"
          @keyup.enter="sendMessage"
          placeholder="和baka聊点什么喵…"
        />
        <button @click="sendMessage">发送</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.baka-btn {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: #ffbde4;
  border: none;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0,0,0,.2);

  /* 提高层级，避免被遮挡 */
  z-index: 9999;
  /* 防止创建新的 stacking context 导致问题 */
  transform: translateZ(0);
}

.baka-drawer {
  position: fixed;
  bottom: 5rem;
  right: 1rem;
  width: 300px;
  max-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* 抽屉比按钮稍低一个层级，保证按钮可覆盖在抽屉上（按需调整） */
  z-index: 9998;
  transform: translateZ(0);
}

/* 保留现有滚动与样式，只调整层级 */
.baka-messages {
  flex: 1;
  padding: .5rem;
  overflow-y: auto;
  font-size: 14px;
}
.baka-messages .assistant { color: #444; }
.baka-messages .user { color: #0077cc; }

.baka-input {
  display: flex;
  border-top: 1px solid #eee;
}
.baka-input input {
  flex: 1;
  border: none;
  padding: .5rem;
}
.baka-input button {
  background: #ffbde4;
  border: none;
  padding: .5rem 1rem;
  cursor: pointer;
}
</style>
