import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
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
