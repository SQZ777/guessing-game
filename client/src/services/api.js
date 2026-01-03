import axios from 'axios'

// 根據環境決定 API Base URL
const getBaseURL = () => {
  // 如果有設定環境變數，使用環境變數（生產環境）
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL
    // 確保 URL 包含 /api 路徑
    return url.endsWith('/api') ? url : `${url}/api`
  }
  // 開發環境使用相對路徑（透過 Vite proxy）
  return '/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 猜測相關 API
export const guessAPI = {
  // 提交猜測
  create: (data) => api.post('/guess', data),
  
  // 檢查是否已猜測
  check: () => api.get('/guess/check'),
  
  // 標記已揭露
  markRevealed: (guessId) => api.put(`/guess/${guessId}/revealed`)
}

// 揭露相關 API
export const revealAPI = {
  // 取得揭露結果
  get: () => api.get('/reveal')
}

// 統計相關 API
export const statisticsAPI = {
  // 取得統計數據
  get: () => api.get('/statistics')
}

export default api
