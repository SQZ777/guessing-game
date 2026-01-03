import { defineStore } from 'pinia'
import { ref } from 'vue'
import { guessAPI } from '@/services/api'

export const useGuessStore = defineStore('guess', () => {
  // 狀態
  const userName = ref(localStorage.getItem('guessingGame_userName') || '')
  const hasGuessed = ref(false)
  const guessId = ref(null)
  const userGuess = ref(null)
  const revealed = ref(false)
  const loading = ref(false)
  const error = ref(null)

  // 保存用戶名到 localStorage
  const saveUserName = (name) => {
    userName.value = name
    localStorage.setItem('guessingGame_userName', name)
  }

  // 檢查猜測狀態（通過名字）
  const checkGuessStatus = async (name) => {
    if (!name) {
      name = userName.value
    }
    
    if (!name) {
      hasGuessed.value = false
      return
    }

    try {
      loading.value = true
      const response = await guessAPI.check(name)
      const data = response.data

      hasGuessed.value = data.hasGuessed
      if (data.hasGuessed) {
        guessId.value = data.guessId
        revealed.value = data.revealed
        userGuess.value = data.guess
      }
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
        userGuess.value = data.data.guess
        revealed.value = false
        saveUserName(name)
        return true
      }
      return false
    } catch (err) {
      console.error('提交猜測失敗:', err)
      error.value = err.response?.data?.error || '提交失敗'
      
      // 如果是因為已經猜測過，也保存相關信息
      if (err.response?.data?.hasGuessed) {
        hasGuessed.value = true
        guessId.value = err.response.data.data?.guessId
        userGuess.value = err.response.data.data?.guess
        revealed.value = err.response.data.data?.revealed
        saveUserName(name)
      }
      
      return false
    } finally {
      loading.value = false
    }
  }

  // 標記已揭露
  const markAsRevealed = async () => {
    if (!guessId.value && !userName.value) return false

    try {
      loading.value = true
      await guessAPI.markRevealed(guessId.value, userName.value)
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
    hasGuessed.value = false
    guessId.value = null
    userGuess.value = null
    revealed.value = false
    error.value = null
    userName.value = ''
    localStorage.removeItem('guessingGame_userName')
  }

  return {
    // 狀態
    userName,
    hasGuessed,
    guessId,
    userGuess,
    revealed,
    loading,
    error,
    // 方法
    saveUserName,
    checkGuessStatus,
    submitGuess,
    markAsRevealed,
    reset
  }
})
