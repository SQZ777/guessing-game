<template>
  <div class="name-list" :class="type">
    <div class="list-header">
      <span class="header-icon">{{ type === 'correct' ? '✅' : '❌' }}</span>
      <span class="header-title">{{ type === 'correct' ? '猜對了！' : '猜錯了！' }}</span>
      <span class="header-count">({{ list.length }}人)</span>
    </div>
    
    <div class="list-content">
      <TransitionGroup name="list" tag="ul" class="names-ul">
        <li v-for="(item, index) in list" :key="item.name + index" class="name-item">
          <span class="name">{{ item.name }}</span>
          <span class="guess-badge" :class="item.guess">
            {{ item.guess === 'boy' ? '👦' : '👧' }}
          </span>
        </li>
      </TransitionGroup>
      
      <div v-if="list.length === 0" class="empty-message">
        暫無資料
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['correct', 'incorrect'].includes(value)
  },
  list: {
    type: Array,
    default: () => []
  }
})
</script>

<style lang="scss" scoped>
.name-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  &.correct {
    border-top: 4px solid #4CAF50;
  }

  &.incorrect {
    border-top: 4px solid #F44336;
  }
}

.list-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.header-icon {
  font-size: 20px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.header-count {
  font-size: 14px;
  color: #666;
}

.list-content {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;
}

.names-ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.name-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f9f9f9;
  }
}

.name {
  font-size: 14px;
  color: #333;
}

.guess-badge {
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 8px;

  &.boy {
    background: rgba(74, 144, 217, 0.1);
  }

  &.girl {
    background: rgba(255, 105, 180, 0.1);
  }
}

.empty-message {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 14px;
}

// 列表動畫
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
