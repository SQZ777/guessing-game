<template>
  <div class="statistics-page">
    <div class="statistics-container">
      <!-- 載入中狀態 -->
      <div v-if="loading && !stats" class="loading-state">
        <div class="spinner"></div>
        <p>載入中...</p>
      </div>

      <!-- 主要內容 -->
      <template v-else-if="stats">
        <!-- 性別揭曉 Banner -->
        <div class="gender-banner" :class="stats.actualGender">
          <div class="banner-content">
            <span class="banner-emoji">🎉</span>
            <h1 class="banner-title">
              寶寶是{{ stats.actualGender === 'boy' ? '男生' : '女生' }}！
            </h1>
            <span class="banner-emoji">🎉</span>
          </div>
        </div>

        <!-- 統計摘要 -->
        <div class="stats-summary">
          <div class="summary-card total">
            <div class="card-value">{{ stats.totalGuesses }}</div>
            <div class="card-label">總參與人數</div>
          </div>
          <div class="summary-card correct">
            <div class="card-value">{{ stats.statistics.correctPercentage }}%</div>
            <div class="card-label">猜對比例</div>
          </div>
        </div>

        <!-- 圖表區域 -->
        <div class="charts-section">
          <StatisticsChart
            :boy-percentage="stats.statistics.boyPercentage"
            :girl-percentage="stats.statistics.girlPercentage"
          />

          <!-- 正確率進度條 -->
          <div class="accuracy-card">
            <h3 class="card-title">猜對率</h3>
            <div class="progress-container">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: `${stats.statistics.correctPercentage}%` }"
                ></div>
              </div>
              <div class="progress-labels">
                <span class="correct-label">
                  ✅ {{ stats.statistics.correctCount }}人猜對
                </span>
                <span class="incorrect-label">
                  ❌ {{ stats.statistics.incorrectCount }}人猜錯
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 名單區域 -->
        <div class="lists-section">
          <NameList type="correct" :list="stats.lists.correct" />
          <NameList type="incorrect" :list="stats.lists.incorrect" />
        </div>

        <!-- 自動更新提示 -->
        <div class="auto-refresh-notice">
          <span class="refresh-icon">🔄</span>
          <span>數據每 5 秒自動更新</span>
        </div>
      </template>

      <!-- 錯誤狀態 -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="fetchStatistics" class="retry-btn">重試</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { statisticsAPI } from '@/services/api'
import StatisticsChart from '@/components/StatisticsChart.vue'
import NameList from '@/components/NameList.vue'

const stats = ref(null)
const loading = ref(false)
const error = ref(null)
let refreshInterval = null

// 取得統計數據
const fetchStatistics = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await statisticsAPI.get()
    if (response.data.success) {
      stats.value = response.data.data
    }
  } catch (err) {
    console.error('取得統計數據失敗:', err)
    error.value = '載入失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  fetchStatistics()
  
  // 設定自動刷新 (每 5 秒)
  refreshInterval = setInterval(fetchStatistics, 5000)
})

// 清理
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style lang="scss" scoped>
.statistics-page {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%);
}

.statistics-container {
  max-width: 800px;
  margin: 0 auto;
}

// 載入狀態
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #4A90D9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// 性別 Banner
.gender-banner {
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 24px;
  text-align: center;

  &.boy {
    background: linear-gradient(135deg, #4A90D9 0%, #1E90FF 100%);
  }

  &.girl {
    background: linear-gradient(135deg, #FF69B4 0%, #FF1493 100%);
  }
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.banner-emoji {
  font-size: 40px;
  animation: bounce 0.6s ease-in-out infinite alternate;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-8px); }
}

.banner-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

// 統計摘要
.stats-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  &.total {
    border-left: 4px solid #4A90D9;
  }

  &.correct {
    border-left: 4px solid #4CAF50;
  }
}

.card-value {
  font-size: 36px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.card-label {
  font-size: 14px;
  color: #666;
}

// 圖表區域
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.accuracy-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px;
  text-align: center;
}

.progress-container {
  margin-top: 20px;
}

.progress-bar {
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.correct-label {
  color: #4CAF50;
}

.incorrect-label {
  color: #F44336;
}

// 名單區域
.lists-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

// 自動更新提示
.auto-refresh-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(74, 144, 217, 0.1);
  border-radius: 8px;
  font-size: 13px;
  color: #4A90D9;
}

.refresh-icon {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 錯誤狀態
.error-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.retry-btn {
  margin-top: 16px;
  padding: 12px 24px;
  background: #4A90D9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #3a7bc8;
  }
}

// 響應式
@media (max-width: 600px) {
  .banner-title {
    font-size: 24px;
  }

  .banner-emoji {
    font-size: 28px;
  }

  .stats-summary {
    grid-template-columns: 1fr;
  }

  .card-value {
    font-size: 28px;
  }
}
</style>
