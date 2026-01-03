# Zeabur 部署指南

## 🚀 快速部署到 Zeabur

### 方式一：使用 Zeabur Dashboard（推薦）

1. **登入 Zeabur**
   - 訪問 [zeabur.com](https://zeabur.com)
   - 使用 GitHub 帳號登入

2. **建立新專案**
   - 點擊 "Create Project"
   - 選擇你的 Git 儲存庫

3. **部署後端服務**
   - 點擊 "Add Service" → "Git"
   - 選擇你的儲存庫
   - Root Directory 設為 `server`
   - Zeabur 會自動檢測到 Dockerfile

4. **設定後端環境變數**
   ```
   NODE_ENV=production
   MONGODB_URI=<你的 MongoDB 連線字串>
   SESSION_SECRET=<隨機生成的密鑰>
   ADMIN_TOKEN=<管理員 Token>
   ACTUAL_GENDER=boy
   ```

5. **新增 MongoDB 資料庫**
   - 點擊 "Add Service" → "Prebuilt"
   - 選擇 "MongoDB"
   - 複製連線字串到後端的 `MONGODB_URI` 環境變數

6. **部署前端服務**
   - 再次點擊 "Add Service" → "Git"
   - 選擇相同儲存庫
   - Root Directory 設為 `client`
   - Zeabur 會自動構建前端

7. **設定前端環境變數**
   - 如果需要指定 API 端點，在構建時設定：
   ```
   VITE_API_URL=<後端服務的 URL>
   ```

8. **綁定域名**
   - 點擊服務卡片
   - 在 "Domains" 區域新增自訂域名或使用 Zeabur 提供的域名

### 方式二：使用 CLI

1. **安裝 Zeabur CLI**
   ```bash
   npm install -g @zeabur/cli
   ```

2. **登入**
   ```bash
   zeabur auth login
   ```

3. **部署**
   ```bash
   # 在專案根目錄執行
   zeabur deploy
   ```

## 📝 環境變數說明

### 後端必要環境變數
- `NODE_ENV` - 設為 `production`
- `MONGODB_URI` - MongoDB 連線字串
- `SESSION_SECRET` - Session 密鑰（至少 32 字元）
- `ADMIN_TOKEN` - 管理員 Token
- `ACTUAL_GENDER` - 實際性別（`boy` 或 `girl`）

### 前端環境變數（可選）
- `VITE_API_URL` - 後端 API 地址（如果前後端不在同一域名）

## 🔧 本地測試 Docker

在部署前，可以先在本地測試 Docker 容器：

```bash
# 構建並啟動所有服務
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止所有服務
docker-compose down

# 停止並刪除所有數據
docker-compose down -v
```

訪問 http://localhost 測試應用。

## 📦 單獨構建映像檔

### 後端
```bash
cd server
docker build -t gender-reveal-backend .
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://localhost:27017/gender-reveal \
  -e SESSION_SECRET=your-secret \
  gender-reveal-backend
```

### 前端
```bash
cd client
docker build -t gender-reveal-frontend .
docker run -p 80:80 gender-reveal-frontend
```

## 🔐 生成安全密鑰

使用以下命令生成隨機密鑰：

```bash
# Linux / macOS
openssl rand -base64 32

# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🌐 CORS 設定

如果前後端分開部署在不同域名，需要更新後端 CORS 設定：

編輯 `server/src/app.js`：

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.zeabur.app',
  credentials: true
}));
```

## 📊 監控與日誌

在 Zeabur Dashboard 中：
- 點擊服務卡片查看即時日誌
- 監控 CPU、記憶體使用率
- 設定自動擴展規則

## 🔄 自動部署

Zeabur 支援 Git 整合：
- Push 到 main 分支會自動觸發部署
- 可以在 Settings 中設定部署分支

## 💡 提示

1. **環境變數管理**：在 Zeabur 中統一管理，不要在程式碼中寫死
2. **資料庫備份**：定期備份 MongoDB 數據
3. **日誌監控**：注意監控錯誤日誌
4. **效能優化**：使用 Zeabur 的 CDN 功能加速靜態資源

## 🆘 常見問題

### 前端無法連接後端
- 檢查 CORS 設定
- 確認前端 API URL 設定正確
- 檢查後端服務是否正常運行

### Session 無法保持
- 確認 `SESSION_SECRET` 已設定
- 檢查 Cookie 的 `secure` 和 `sameSite` 設定
- HTTPS 環境下需要 `secure: true`

### MongoDB 連線失敗
- 確認 `MONGODB_URI` 格式正確
- 檢查網路連接
- 確認 MongoDB 服務正常運行
