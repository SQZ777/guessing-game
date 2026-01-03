<template>
  <div class="reveal-page">
    <div class="reveal-container">
      <!-- 標題 -->
      <div class="page-header">
        <h1>🎮 來揭曉答案吧！</h1>
        <p>移動爪子，按下「夾」來揭曉寶寶性別</p>
      </div>

      <!-- 夾娃娃機 -->
      <ClawMachine 
        ref="clawMachineRef"
        @grab-complete="handleGrabComplete" 
      />

      <!-- 操作提示 -->
      <div class="instructions">
        <div class="instruction-item">
          <span class="key">◀ ▶</span>
          <span class="desc">移動爪子</span>
        </div>
        <div class="instruction-item">
          <span class="key">🎯</span>
          <span class="desc">開始夾取</span>
        </div>
      </div>
    </div>

    <!-- 性別揭露彈窗 -->
    <GenderRevealPopup
      :show="showPopup"
      :gender="revealData.gender"
      :is-correct="revealData.isCorrect"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGuessStore } from '@/stores/guessStore'
import { revealAPI } from '@/services/api'
import ClawMachine from '@/components/ClawMachine.vue'
import GenderRevealPopup from '@/components/GenderRevealPopup.vue'

const router = useRouter()
const guessStore = useGuessStore()

const clawMachineRef = ref(null)
const showPopup = ref(false)
const revealData = ref({
  gender: 'boy',
  isCorrect: false
})

// 載入揭露資料
onMounted(async () => {
  try {
    const response = await revealAPI.get()
    if (response.data.success) {
      revealData.value = {
        gender: response.data.data.gender,
        isCorrect: response.data.data.isCorrect
      }
    }
  } catch (error) {
    console.error('載入揭露資料失敗:', error)
    // 如果載入失敗，可能是尚未猜測，跳轉回首頁
    router.push('/')
  }
})

// 抓取完成處理
const handleGrabComplete = () => {
  showPopup.value = true
}

// 確認後跳轉
const handleConfirm = async () => {
  // 標記為已揭露
  await guessStore.markAsRevealed()
  
  // 跳轉到統計頁面
  router.push('/statistics')
}
</script>

<style lang="scss" scoped>
.reveal-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%);
}

.reveal-container {
  max-width: 450px;
  width: 100%;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
  color: white;

  h1 {
    font-size: 28px;
    margin: 0 0 8px;
    text-shadow: 0 2px 10px rgba(255, 255, 255, 0.2);
  }

  p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
}

.instructions {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
}

.instruction-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.key {
  font-size: 20px;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 8px;
}

.desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 480px) {
  .page-header {
    h1 {
      font-size: 22px;
    }
  }
}
</style>
