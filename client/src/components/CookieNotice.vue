<template>
  <Transition name="fade">
    <div v-if="show" class="cookie-notice">
      <div class="notice-content">
        <div class="notice-icon">🍪</div>
        <div class="notice-text">
          <h3>Cookie 設定提示</h3>
          <p>此網站需要使用 Cookie 來記住您的猜測。請確保瀏覽器允許 Cookie。</p>
        </div>
        <button @click="handleAllow" class="allow-btn">
          我知道了
        </button>
        <button @click="handleClose" class="close-btn">×</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storageAccessManager } from '@/utils/storageAccess'

const show = ref(false)

onMounted(async () => {
  // 檢查是否需要顯示提示
  const hasAccess = await storageAccessManager.checkAccess()
  
  // 如果沒有訪問權限且支援 Storage Access API，顯示提示
  if (!hasAccess && storageAccessManager.isSupported()) {
    // 延遲顯示，避免影響頁面載入
    setTimeout(() => {
      show.value = true
    }, 1000)
  }
})

const handleAllow = async () => {
  try {
    await storageAccessManager.requestAccess()
    show.value = false
  } catch (error) {
    console.error('請求 Cookie 訪問失敗:', error)
  }
}

const handleClose = () => {
  show.value = false
}
</script>

<style scoped>
.cookie-notice {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}

.notice-content {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  position: relative;
  border: 2px solid #4A90D9;
}

.notice-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.notice-text h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.notice-text p {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px;
  line-height: 1.5;
}

.allow-btn {
  background: #4A90D9;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.allow-btn:hover {
  background: #3a7bc8;
  transform: translateY(-1px);
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #333;
}

/* 淡入淡出動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 480px) {
  .cookie-notice {
    bottom: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>
