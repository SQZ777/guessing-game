<template>
  <div class="guess-page">
    <div class="guess-container">
      <!-- 標題區域 -->
      <div class="header">
        <h1 class="title">🎉 猜猜寶寶性別 🎉</h1>
        <p class="subtitle">來猜猜看寶寶是男生還是女生吧！</p>
      </div>

      <!-- 表單區域 -->
      <form @submit.prevent="handleSubmit" class="guess-form">
        <!-- 姓名輸入 -->
        <div class="form-group">
          <label for="name" class="form-label">你的名字</label>
          <input
            id="name"
            v-model="name"
            type="text"
            class="form-input"
            placeholder="請輸入你的名字"
            :disabled="loading"
            required
          />
        </div>

        <!-- 性別選擇 -->
        <div class="form-group">
          <label class="form-label">你覺得是？</label>
          <div class="gender-options">
            <button
              type="button"
              class="gender-btn boy"
              :class="{ active: selectedGender === 'boy' }"
              @click="selectedGender = 'boy'"
              :disabled="loading"
            >
              <span class="gender-icon">👦</span>
              <span class="gender-text">男生</span>
            </button>
            <button
              type="button"
              class="gender-btn girl"
              :class="{ active: selectedGender === 'girl' }"
              @click="selectedGender = 'girl'"
              :disabled="loading"
            >
              <span class="gender-icon">👧</span>
              <span class="gender-text">女生</span>
            </button>
          </div>
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- 提交按鈕 -->
        <button
          type="submit"
          class="submit-btn"
          :disabled="!isValid || loading"
        >
          <span v-if="loading">提交中...</span>
          <span v-else>🎯 確認猜測</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGuessStore } from '@/stores/guessStore'

const router = useRouter()
const guessStore = useGuessStore()

// 表單資料
const name = ref('')
const selectedGender = ref('')
const errorMessage = ref('')

// 計算屬性
const loading = computed(() => guessStore.loading)
const isValid = computed(() => {
  return name.value.trim().length > 0 && selectedGender.value !== ''
})

// 提交表單
const handleSubmit = async () => {
  if (!isValid.value) return

  errorMessage.value = ''

  const success = await guessStore.submitGuess(name.value.trim(), selectedGender.value)

  if (success) {
    router.push('/reveal')
  } else {
    errorMessage.value = guessStore.error || '提交失敗，請稍後再試'
  }
}
</script>

<style lang="scss" scoped>
.guess-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #fff9e6 0%, #ffe4ec 50%, #e6f3ff 100%);
}

.guess-container {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 450px;
  width: 100%;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #666;
}

.guess-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input {
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #4A90D9;
    box-shadow: 0 0 0 4px rgba(74, 144, 217, 0.1);
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
}

.gender-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.gender-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  border: 3px solid #e0e0e0;
  border-radius: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.boy {
    &:hover:not(:disabled) {
      border-color: #4A90D9;
      background: rgba(74, 144, 217, 0.05);
    }

    &.active {
      border-color: #4A90D9;
      background: rgba(74, 144, 217, 0.1);
      box-shadow: 0 4px 12px rgba(74, 144, 217, 0.3);
    }
  }

  &.girl {
    &:hover:not(:disabled) {
      border-color: #FF69B4;
      background: rgba(255, 105, 180, 0.05);
    }

    &.active {
      border-color: #FF69B4;
      background: rgba(255, 105, 180, 0.1);
      box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
    }
  }
}

.gender-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.gender-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.error-message {
  padding: 12px 16px;
  background: #fff5f5;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  color: #c62828;
  font-size: 14px;
  text-align: center;
}

.submit-btn {
  padding: 16px 24px;
  background: linear-gradient(135deg, #4A90D9 0%, #FF69B4 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
}

@media (max-width: 480px) {
  .guess-container {
    padding: 24px;
  }

  .title {
    font-size: 24px;
  }

  .gender-icon {
    font-size: 36px;
  }
}
</style>
