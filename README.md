# 寶寶性別揭露遊戲 🎉

一個互動式的寶寶性別揭露 Web 應用程式，讓親朋好友透過有趣的夾娃娃遊戲來猜測並揭曉寶寶的性別。

## 功能特色

- 🎮 **夾娃娃遊戲** - 生動有趣的夾娃娃機互動動畫
- 📊 **即時統計** - 即時顯示猜測結果與正確率
- 🔒 **防重複猜測** - 使用 Session 確保每人只能猜測一次
- 📱 **響應式設計** - 支援手機、平板、桌機

## 技術架構

### 前端
- Vue.js 3 (Composition API)
- Vue Router
- Pinia
- GSAP (動畫)
- Axios
- SCSS

### 後端
- Node.js
- Express.js
- MongoDB + Mongoose
- express-session + connect-mongo

## 專案結構

```
guessing-game/
├── client/                 # Vue.js 前端
│   ├── src/
│   │   ├── assets/        # 靜態資源與樣式
│   │   ├── components/    # Vue 組件
│   │   ├── views/         # 頁面組件
│   │   ├── router/        # 路由配置
│   │   ├── stores/        # Pinia 狀態管理
│   │   └── services/      # API 服務
│   └── package.json
│
├── server/                 # Node.js 後端
│   ├── src/
│   │   ├── config/        # 配置檔案
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 資料模型
│   │   ├── routes/        # API 路由
│   │   └── middleware/    # 中介軟體
│   ├── .env               # 環境變數
│   └── package.json
│
├── SPEC.md                 # 技術規格書
└── README.md
```

## 快速開始

### 前置需求

- Node.js 18+
- MongoDB 6+
- npm 或 yarn

### 安裝步驟

1. **複製專案**
   ```bash
   git clone <repository-url>
   cd guessing-game
   ```

2. **安裝後端依賴**
   ```bash
   cd server
   npm install
   ```

3. **設定環境變數**
   
   編輯 `server/.env` 檔案：
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/gender-reveal
   SESSION_SECRET=your-super-secret-key-change-this
   ADMIN_TOKEN=admin-secret-token-change-this
   ACTUAL_GENDER=boy  # 設定實際性別：boy 或 girl
   ```

4. **安裝前端依賴**
   ```bash
   cd ../client
   npm install
   ```

### 啟動開發環境

1. **啟動 MongoDB**
   ```bash
   mongod
   ```

2. **啟動後端服務**
   ```bash
   cd server
   npm run dev
   ```

3. **啟動前端服務**（另開終端機）
   ```bash
   cd client
   npm run dev
   ```

4. **開啟瀏覽器**
   
   訪問 http://localhost:5173

## API 文件

### 猜測相關

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/guess` | 提交猜測 |
| GET | `/api/guess/check` | 檢查是否已猜測 |
| PUT | `/api/guess/:id/revealed` | 標記已揭露 |

### 揭露相關

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/reveal` | 取得揭露結果 |

### 統計相關

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/statistics` | 取得統計數據 |

### 管理員

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/admin/set-gender` | 設定實際性別 |

## 設定實際性別

有兩種方式可以設定寶寶的實際性別：

### 方式一：環境變數
編輯 `server/.env` 檔案中的 `ACTUAL_GENDER` 值。

### 方式二：API 呼叫
```bash
curl -X POST http://localhost:3000/api/admin/set-gender \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-secret-token-change-this" \
  -d '{"gender": "boy"}'
```

## 部署

### 建置前端
```bash
cd client
npm run build
```

### 生產環境注意事項
1. 更新 `server/.env` 中的 `NODE_ENV=production`
2. 更新 `SESSION_SECRET` 為安全的隨機字串
3. 更新 `ADMIN_TOKEN` 為安全的 token
4. 設定正確的 `MONGODB_URI`
5. 設定 CORS 允許的來源

## 授權

MIT License
