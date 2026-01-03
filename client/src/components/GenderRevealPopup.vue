<template>
  <Teleport to="body">
    <Transition name="popup">
      <div v-if="show" class="popup-overlay" @click.self="handleConfirm">
        <div class="popup-container" :class="genderClass">
          <!-- 裝飾元素 -->
          <div class="confetti-container">
            <div v-for="n in 20" :key="n" class="confetti" :style="getConfettiStyle(n)"></div>
          </div>

          <!-- 主要內容 -->
          <div class="popup-content">
            <!-- 性別圖示 -->
            <div class="gender-icon-wrapper">
              <div class="gender-icon">
                {{ gender === 'boy' ? '👶' : '👶' }}
              </div>
              <div class="gender-symbol">
                {{ gender === 'boy' ? '♂️' : '♀️' }}
              </div>
            </div>

            <!-- 揭曉文字 -->
            <h1 class="reveal-title">
              {{ gender === 'boy' ? '🎉 是男寶寶！🎉' : '🎀 是女寶寶！🎀' }}
            </h1>

            <!-- 猜測結果 -->
            <div class="guess-result" :class="{ correct: isCorrect, wrong: !isCorrect }">
              <span class="result-icon">{{ isCorrect ? '✅' : '❌' }}</span>
              <span class="result-text">
                {{ isCorrect ? '恭喜你猜對了！' : '可惜猜錯了！' }}
              </span>
            </div>

            <!-- 確認按鈕 -->
            <button class="confirm-btn" @click="handleConfirm">
              查看大家的猜測 →
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  gender: {
    type: String,
    required: true,
    validator: (value) => ['boy', 'girl'].includes(value)
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm'])

const genderClass = computed(() => props.gender)

const handleConfirm = () => {
  emit('confirm')
}

// 生成隨機彩帶樣式
const getConfettiStyle = (index) => {
  const colors = props.gender === 'boy' 
    ? ['#4A90D9', '#87CEEB', '#1E90FF', '#ffffff']
    : ['#FF69B4', '#FFB6C1', '#FF1493', '#ffffff']
  
  return {
    left: `${Math.random() * 100}%`,
    backgroundColor: colors[index % colors.length],
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${2 + Math.random() * 2}s`
  }
}
</script>

<style lang="scss" scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.popup-container {
  position: relative;
  background: white;
  border-radius: 24px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  &.boy {
    background: linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%);
    border: 4px solid #4A90D9;
  }

  &.girl {
    background: linear-gradient(180deg, #fce4ec 0%, #f8bbd9 100%);
    border: 4px solid #FF69B4;
  }
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  top: -20px;
  width: 10px;
  height: 20px;
  border-radius: 2px;
  animation: fall linear infinite;
}

@keyframes fall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(500px) rotate(720deg);
    opacity: 0;
  }
}

.popup-content {
  position: relative;
  z-index: 1;
}

.gender-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.gender-icon {
  font-size: 80px;
  animation: bounce 0.6s ease-in-out infinite alternate;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-10px); }
}

.gender-symbol {
  position: absolute;
  bottom: -5px;
  right: -15px;
  font-size: 40px;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.reveal-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 20px;
  
  .boy & {
    color: #1565c0;
  }

  .girl & {
    color: #c2185b;
  }
}

.guess-result {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 30px;
  margin-bottom: 24px;
  font-size: 18px;
  font-weight: 600;

  &.correct {
    background: rgba(76, 175, 80, 0.2);
    color: #2e7d32;
  }

  &.wrong {
    background: rgba(244, 67, 54, 0.2);
    color: #c62828;
  }
}

.result-icon {
  font-size: 24px;
}

.confirm-btn {
  display: inline-block;
  padding: 16px 32px;
  border: none;
  border-radius: 30px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  .boy & {
    background: linear-gradient(135deg, #4A90D9 0%, #1E90FF 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(74, 144, 217, 0.4);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(74, 144, 217, 0.5);
    }
  }

  .girl & {
    background: linear-gradient(135deg, #FF69B4 0%, #FF1493 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 105, 180, 0.5);
    }
  }
}

// 過渡動畫
.popup-enter-active {
  animation: popup-in 0.5s ease-out;

  .popup-container {
    animation: popup-scale-in 0.5s ease-out;
  }
}

.popup-leave-active {
  animation: popup-out 0.3s ease-in;
}

@keyframes popup-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes popup-scale-in {
  0% {
    transform: scale(0.5) translateY(50px);
  }
  100% {
    transform: scale(1) translateY(0);
  }
}

@keyframes popup-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@media (max-width: 400px) {
  .popup-container {
    padding: 30px 20px;
  }

  .gender-icon {
    font-size: 60px;
  }

  .reveal-title {
    font-size: 22px;
  }

  .guess-result {
    font-size: 16px;
    padding: 10px 20px;
  }

  .confirm-btn {
    font-size: 16px;
    padding: 14px 28px;
  }
}
</style>
