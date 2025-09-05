<script setup>
import { ref } from "vue"
import { sendToBaka } from "@/api/index.js"  // 引入你写的 API 函数

const open = ref(false)
const input = ref("")
const messages = ref([
  { role: "assistant", content: "喵～咱是baka，窝在你的小窝里了w" }
])

async function sendMessage() {
  if (!input.value.trim()) return
  const userMessage = { role: "user", content: input.value }
  messages.value.push(userMessage)
  const currentInput = input.value
  input.value = ""

  try {
    // 调用你的 sendToBaka API
    const data = await sendToBaka([...messages.value, userMessage])
    messages.value.push({ role: "assistant", content: data.reply })
  } catch (e) {
    messages.value.push({ role: "assistant", content: "呜，baka出错了喵…" })
  }
}
</script>

<template>
  <div>
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
}

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
