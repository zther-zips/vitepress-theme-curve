<template>
  <div class="random-quote s-card" @click="handleClick">
    <div class="rq-left" aria-hidden="true">💬</div>
    <div class="rq-main" aria-live="polite">
      <p class="rq-content">{{ text }}</p>
      <p v-if="error" class="rq-author">失败：{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 改为相对地址，走后端代理（Vercel 函数或本地 proxy）
const API_URL = '/api/baka'

const text = ref('')
const isStreaming = ref(false)
const error = ref('')

onMounted(() => generate())
function handleClick() {
  if (isStreaming.value) return
  generate()
}

async function generate() {
  text.value = ''
  error.value = ''
  isStreaming.value = true

  try {
    // 只传 messages，由后端负责 model/key/stream 等
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: `
你是一位温柔、可爱、带一点梦幻气息的存在。
你要为访问者写一句轻声的问候，像风轻轻碰到人。
语气要柔和、自然，不要理性分析，不要哲思，不要说大道理。
不要显得正式或礼貌，只要像在和喜欢的人悄悄说话。
每句话都要独立成句，不要连续两句。
可以带一点点可爱、撒娇、或者微妙的依恋感。
用中文输出。

示例风格（仅供参考，不可照抄）：
- 「嘿，你来了呀，我刚好也在想你～」
- 「要不要在这儿坐一会儿，风好温柔呢。」
- 「我小心地踩着光，跑去迎你。」
- 「我在等一个信号，好像是你的心跳。」
            ` },
          { role: 'user', content: '请写一句新的打招呼句子，谢谢你，抱抱qwq~' }
        ],
        "temperature": 0.9
      })
    })

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const data = await resp.json()
    text.value = data.reply || data.choices?.[0]?.message?.content || data.choices?.[0]?.text || ''
  } catch (e) {
    error.value = e.message
  } finally {
    isStreaming.value = false
  }
}
</script>

<style scoped>
.random-quote {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--main-card-border);
  border-radius: 12px;
  background: var(--main-card-background);
  box-shadow: var(--card-box-shadow, 0 2px 8px rgba(0, 0, 0, 0.08));
  transition: box-shadow .18s ease;
  cursor: pointer;
  user-select: none;
}
.random-quote:hover {
  background: var(--main-card-background);
  border-color: var(--main-card-border);
  box-shadow: var(--card-box-shadow, 0 2px 8px rgba(0,0,0,0.08));
}
.rq-left { font-size: 1.1rem; opacity: .85; }
.rq-main { flex: 1 1 auto; min-width: 0; }
.rq-content { margin: 0; color: var(--main-text-1); line-height: 1.6; font-size: .95rem; white-space: pre-line; }
.rq-author { margin-top: .4rem; color: var(--main-text-2); font-size: .85rem; }
</style>