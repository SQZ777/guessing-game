<template>
  <div class="chart-container">
    <h3 class="chart-title">猜測分布</h3>
    <div class="pie-chart">
      <svg viewBox="0 0 100 100" class="chart-svg">
        <!-- 背景圓 -->
        <circle cx="50" cy="50" r="40" fill="#f0f0f0" />
        
        <!-- 男生比例 -->
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke="#4A90D9"
          stroke-width="40"
          :stroke-dasharray="`${boyDashArray} ${100 - boyDashArray}`"
          stroke-dashoffset="25"
          class="chart-segment boy"
        />
        
        <!-- 女生比例 -->
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke="#FF69B4"
          stroke-width="40"
          :stroke-dasharray="`${girlDashArray} ${100 - girlDashArray}`"
          :stroke-dashoffset="25 - boyDashArray"
          class="chart-segment girl"
        />

        <!-- 中心白圓 -->
        <circle cx="50" cy="50" r="20" fill="white" />
      </svg>
    </div>

    <!-- 圖例 -->
    <div class="chart-legend">
      <div class="legend-item">
        <span class="legend-color boy"></span>
        <span class="legend-label">👦 男生</span>
        <span class="legend-value">{{ boyPercentage }}%</span>
      </div>
      <div class="legend-item">
        <span class="legend-color girl"></span>
        <span class="legend-label">👧 女生</span>
        <span class="legend-value">{{ girlPercentage }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  boyPercentage: {
    type: Number,
    default: 0
  },
  girlPercentage: {
    type: Number,
    default: 0
  }
})

// 計算圓環的 dasharray 值 (圓周 = 2 * π * 40 ≈ 251, 但我們用百分比簡化)
const boyDashArray = computed(() => {
  return (props.boyPercentage / 100) * 100
})

const girlDashArray = computed(() => {
  return (props.girlPercentage / 100) * 100
})
</script>

<style lang="scss" scoped>
.chart-container {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px;
  text-align: center;
}

.pie-chart {
  width: 150px;
  height: 150px;
  margin: 0 auto 16px;
}

.chart-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.chart-segment {
  transition: stroke-dasharray 0.5s ease;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;

  &.boy {
    background: #4A90D9;
  }

  &.girl {
    background: #FF69B4;
  }
}

.legend-label {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.legend-value {
  font-size: 14px;
  font-weight: 600;
  color: #666;
}
</style>
