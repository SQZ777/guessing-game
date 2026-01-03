import { defineStore } from 'pinia'
import { ref } from 'vue'
import { guessAPI } from '@/services/api'

export const useGuessStore = defineStore('guess', () => {
  // 狀態
  const checked = ref(false)
  const hasGuessed = ref(false)
  const guessId = ref(null)
  const revealed = ref(false)
  const loading = ref(false)
  const error = ref(null)

  // 檢查猜測狀態
  const checkGuessStatus = async () => {
    try {
      loading.value = true
      const response = await guessAPI.check()
      const data = response.data

      hasGuessed.value = data.hasGuessed
      if (data.hasGuessed) {
        guessId.value = data.guessId
        revealed.value = data.revealed
      }
      checked.value = true
    } catch (err) {
      console.error('檢查猜測狀態失敗:', err)
      error.value = err.response?.data?.error || '檢查失敗'
    } finally {
      loading.value = false
    }
  }

  // 提交猜測
  const submitGuess = async (name, guess) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await guessAPI.create({ name, guess })
      const data = response.data

      if (data.success) {
        hasGuessed.value = true
        guessId.value = data.data.guessId
        revealed.value = false
        return true
      }
      return false
    } catch (err) {
      console.error('提交猜測失敗:', err)
      error.value = err.response?.data?.error || '提交失敗'
      return false
    } finally {
      loading.value = false
    }
  }

  // 標記已揭露
  const markAsRevealed = async () => {
    if (!guessId.value) return false

    try {
      loading.value = true
      await guessAPI.markRevealed(guessId.value)
      revealed.value = true
      return true
    } catch (err) {
      console.error('標記揭露失敗:', err)
      error.value = err.response?.data?.error || '操作失敗'
      return false
    } finally {
      loading.value = false
    }
  }

  // 重置狀態
  const reset = () => {
    checked.value = false
    hasGuessed.value = false
    guessId.value = null
    revealed.value = false
    error.value = null
  }

  return {
    // 狀態
    checked,
    hasGuessed,
    guessId,
    revealed,
    loading,
    error,
    // 方法
    checkGuessStatus,
    submitGuess,
    markAsRevealed,
    reset
  }
})
