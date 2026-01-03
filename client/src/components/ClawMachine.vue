<template>
  <div class="claw-machine">
    <!-- 機台外框 -->
    <div class="machine-frame">
      <!-- 機台頂部 -->
      <div class="machine-header">
        <div class="header-lights">
          <span class="light" v-for="n in 5" :key="n"></span>
        </div>
        <h2 class="machine-title">✨ 性別揭露機 ✨</h2>
        <div class="header-lights">
          <span class="light" v-for="n in 5" :key="n"></span>
        </div>
      </div>

      <!-- 遊戲區域 -->
      <div class="game-area">
        <!-- 玻璃反光效果 -->
        <div class="glass-reflection"></div>

        <!-- 爪子軌道 -->
        <div class="claw-track">
          <div 
            class="claw-assembly" 
            :style="{ left: `${clawPosition}%` }"
            :class="{ 'is-grabbing': isGrabbing }"
          >
            <!-- 爪子繩索 -->
            <div class="claw-rope" :style="{ height: `${ropeHeight}px` }"></div>
            
            <!-- 爪子本體 -->
            <div class="claw" :class="{ 'closed': clawClosed }">
              <div class="claw-arm left"></div>
              <div class="claw-arm right"></div>
              <div class="claw-arm center"></div>
            </div>

            <!-- 抓取的禮物 -->
            <div v-if="hasGift" class="grabbed-gift">{{ grabbedEmoji }}</div>
          </div>
        </div>

        <!-- 禮物區域 -->
        <div class="gifts-area">
          <div 
            v-for="(gift, index) in gifts" 
            :key="index"
            class="gift-item"
            :style="{ left: `${gift.x}%`, bottom: `${gift.y}px` }"
          >
            {{ gift.emoji }}
          </div>
        </div>
      </div>

      <!-- 控制面板 -->
      <div class="control-panel">
        <div class="direction-controls">
          <button 
            class="control-btn left-btn"
            @mousedown="startMove('left')"
            @mouseup="stopMove"
            @mouseleave="stopMove"
            @touchstart.prevent="startMove('left')"
            @touchend="stopMove"
            :disabled="isAnimating"
          >
            ◀
          </button>
          <button 
            class="control-btn grab-btn"
            @click="startGrab"
            :disabled="isAnimating"
          >
            🎯 夾！
          </button>
          <button 
            class="control-btn right-btn"
            @mousedown="startMove('right')"
            @mouseup="stopMove"
            @mouseleave="stopMove"
            @touchstart.prevent="startMove('right')"
            @touchend="stopMove"
            :disabled="isAnimating"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const emit = defineEmits(['grab-complete'])

// 爪子狀態
const clawPosition = ref(50) // 0-100 百分比
const ropeHeight = ref(20)
const clawClosed = ref(false)
const isGrabbing = ref(false)
const isAnimating = ref(false)
const hasGift = ref(false)
const grabbedEmoji = ref('🎁')

// 移動相關
let moveInterval = null
const moveSpeed = 2

// 禮物配置
const gifts = ref([
  { emoji: '🎁', x: 12, y: 10 },
  { emoji: '🧸', x: 25, y: 5 },
  { emoji: '🎀', x: 38, y: 12 },
  { emoji: '🎁', x: 52, y: 8 },
  { emoji: '🧸', x: 66, y: 15 },
  { emoji: '🎀', x: 78, y: 6 },
])

// 開始移動
const startMove = (direction) => {
  if (isAnimating.value) return
  
  stopMove()
  moveInterval = setInterval(() => {
    if (direction === 'left') {
      clawPosition.value = Math.max(10, clawPosition.value - moveSpeed)
    } else {
      clawPosition.value = Math.min(90, clawPosition.value + moveSpeed)
    }
  }, 50)
}

// 停止移動
const stopMove = () => {
  if (moveInterval) {
    clearInterval(moveInterval)
    moveInterval = null
  }
}

// 找到最接近爪子位置的禮物
const findClosestGift = () => {
  let closestGift = gifts.value[0]
  let minDistance = Math.abs(clawPosition.value - closestGift.x)
  
  gifts.value.forEach(gift => {
    const distance = Math.abs(clawPosition.value - gift.x)
    if (distance < minDistance) {
      minDistance = distance
      closestGift = gift
    }
  })
  
  return closestGift
}

// 開始抓取動畫
const startGrab = () => {
  if (isAnimating.value) return
  
  isAnimating.value = true
  isGrabbing.value = true

  // 找到要抓取的禮物
  const targetGift = findClosestGift()
  grabbedEmoji.value = targetGift.emoji
  isGrabbing.value = true

  // 動畫序列
  const timeline = gsap.timeline({
    onComplete: () => {
      emit('grab-complete')
    }
  })

  // Phase 1: 爪子下降
  timeline.to(ropeHeight, {
    value: 180,
    duration: 1.5,
    ease: 'power2.in'
  })

  // Phase 2: 爪子閉合
  timeline.call(() => {
    clawClosed.value = true
  })
  timeline.to({}, { duration: 0.5 })

  // Phase 3: 顯示抓到的禮物
  timeline.call(() => {
    hasGift.value = true
  })

  // Phase 4: 爪子上升
  timeline.to(ropeHeight, {
    value: 20,
    duration: 1.5,
    ease: 'power2.out'
  })

  // Phase 5: 短暫停頓後觸發揭露
  timeline.to({}, { duration: 0.5 })
}

// 重置狀態
const reset = () => {
  clawPosition.value = 50
  ropeHeight.value = 20
  clawClosed.value = false
  isGrabbing.value = false
  isAnimating.value = false
  hasGift.value = false
  grabbedEmoji.value = '🎁'
}

// 清理
onUnmounted(() => {
  stopMove()
})

// 暴露方法給父組件
defineExpose({ reset })
</script>

<style lang="scss" scoped>
.claw-machine {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.machine-frame {
  background: linear-gradient(180deg, #5c4d7d 0%, #3d3260 100%);
  border-radius: 20px;
  padding: 15px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.3),
    inset 0 2px 0 rgba(255, 255, 255, 0.1);
}

.machine-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  background: linear-gradient(180deg, #ff6b9d 0%, #c44569 100%);
  border-radius: 12px 12px 0 0;
  margin: -15px -15px 0 -15px;
  padding: 15px;
}

.header-lights {
  display: flex;
  gap: 6px;
}

.light {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ffeb3b;
  animation: blink 0.5s ease-in-out infinite alternate;

  &:nth-child(2) { animation-delay: 0.1s; }
  &:nth-child(3) { animation-delay: 0.2s; }
  &:nth-child(4) { animation-delay: 0.3s; }
  &:nth-child(5) { animation-delay: 0.4s; }
}

@keyframes blink {
  from { opacity: 0.4; box-shadow: none; }
  to { opacity: 1; box-shadow: 0 0 10px #ffeb3b; }
}

.machine-title {
  font-size: 18px;
  font-weight: 700;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
}

.game-area {
  position: relative;
  height: 300px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border: 4px solid #2d2d44;
  border-radius: 8px;
  margin-top: 15px;
  overflow: hidden;
}

.glass-reflection {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 50%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 10;
}

.claw-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: #2d2d44;
}

.claw-assembly {
  position: absolute;
  top: 30px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: left 0.1s ease-out;
  z-index: 5;
}

.claw-rope {
  width: 4px;
  background: linear-gradient(180deg, #888 0%, #666 100%);
  border-radius: 2px;
}

.claw {
  position: relative;
  width: 50px;
  height: 40px;
  display: flex;
  justify-content: center;
}

.claw-arm {
  position: absolute;
  width: 8px;
  height: 35px;
  background: linear-gradient(180deg, #ffd700 0%, #ff8c00 100%);
  border-radius: 4px;
  transform-origin: top center;
  transition: transform 0.3s ease;

  &.left {
    left: 5px;
    transform: rotate(-25deg);
  }

  &.right {
    right: 5px;
    transform: rotate(25deg);
  }

  &.center {
    left: 50%;
    transform: translateX(-50%);
  }
}

.claw.closed {
  .claw-arm.left {
    transform: rotate(-5deg);
  }
  .claw-arm.right {
    transform: rotate(5deg);
  }
}

.grabbed-gift {
  position: absolute;
  bottom: -30px;
  font-size: 28px;
  animation: swing 0.5s ease-in-out infinite alternate;
}

@keyframes swing {
  from { transform: rotate(-5deg); }
  to { transform: rotate(5deg); }
}

.gifts-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.05) 100%);
}

.gift-item {
  position: absolute;
  font-size: 32px;
  animation: float 2s ease-in-out infinite;

  &:nth-child(even) {
    animation-delay: -1s;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.control-panel {
  margin-top: 15px;
  padding: 15px;
  background: linear-gradient(180deg, #4a4a6a 0%, #3a3a5a 100%);
  border-radius: 12px;
}

.direction-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.control-btn {
  padding: 15px 25px;
  border: none;
  border-radius: 12px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.left-btn, .right-btn {
  background: linear-gradient(180deg, #64b5f6 0%, #1976d2 100%);
  color: white;
  box-shadow: 0 4px 0 #0d47a1;

  &:active:not(:disabled) {
    box-shadow: 0 2px 0 #0d47a1;
    transform: translateY(2px);
  }
}

.grab-btn {
  padding: 15px 30px;
  background: linear-gradient(180deg, #ff6b6b 0%, #ee5a5a 100%);
  color: white;
  box-shadow: 0 4px 0 #c0392b;
  font-size: 18px;

  &:active:not(:disabled) {
    box-shadow: 0 2px 0 #c0392b;
    transform: translateY(2px);
  }

  &:hover:not(:disabled) {
    background: linear-gradient(180deg, #ff8080 0%, #ff6b6b 100%);
  }
}

@media (max-width: 400px) {
  .machine-title {
    font-size: 14px;
  }

  .control-btn {
    padding: 12px 18px;
    font-size: 16px;
  }

  .grab-btn {
    font-size: 14px;
  }
}
</style>
