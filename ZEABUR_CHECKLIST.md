# Zeabur 快速部署檢查清單

## ✅ 部署前檢查

### 後端服務設定
- [ ] 服務名稱：`guessing-game-res`（或你的自訂名稱）
- [ ] Root Directory：`server`
- [ ] 端口：`8080`（Zeabur 會自動映射）

#### 後端環境變數
```env
NODE_ENV=production
PORT=8080
MONGODB_URI=<從 Zeabur MongoDB 服務取得>
SESSION_SECRET=<使用隨機生成的 32+ 字元密鑰>
ADMIN_TOKEN=<使用隨機生成的管理員 Token>
ACTUAL_GENDER=boy
CORS_ORIGIN=<前端服務的完整 URL>
```

### 前端服務設定
- [ ] Root Directory：`client`
- [ ] 確認已設定環境變數

#### 前端環境變數（必要）
```env
VITE_API_URL=http://guessing-game-res.zeabur.internal:8080/api
```

**重要提醒**：
- 將 `guessing-game-res` 替換為你的實際後端服務名稱
- 內部 URL 使用 `.zeabur.internal` 域名
- 必須包含 `/api` 路徑

### MongoDB 服務
- [ ] 已在 Zeabur 新增 MongoDB Prebuilt 服務
- [ ] 已複製連線字串到後端的 `MONGODB_URI`

## 📝 部署步驟

1. **推送代碼到 GitHub**
   ```bash
   git add .
   git commit -m "Configure for Zeabur deployment"
   git push
   ```

2. **在 Zeabur 建立服務**
   - 新增 MongoDB（Prebuilt）
   - 新增後端服務（Git → server 目錄）
   - 新增前端服務（Git → client 目錄）

3. **配置環境變數**
   - 按照上方清單設定所有必要的環境變數
   - 特別注意前端的 `VITE_API_URL` 必須正確

4. **等待構建完成**
   - 查看構建日誌確認沒有錯誤
   - 確認服務都正常運行

5. **測試應用**
   - 訪問前端域名
   - 測試猜測功能
   - 檢查統計頁面是否正常

## 🔍 故障排除

### 前端無法連接後端
✅ **檢查項目**：
- [ ] `VITE_API_URL` 是否正確設定
- [ ] 後端服務名稱是否與 URL 中的一致
- [ ] 後端 CORS 是否允許前端域名
- [ ] 後端服務是否正常運行（檢查日誌）

### Session 無法保持
✅ **檢查項目**：
- [ ] `SESSION_SECRET` 是否已設定
- [ ] Cookie 設定是否正確（`secure: true` for HTTPS）
- [ ] 前端是否設定 `withCredentials: true`

### MongoDB 連線失敗
✅ **檢查項目**：
- [ ] `MONGODB_URI` 格式是否正確
- [ ] MongoDB 服務是否正常運行
- [ ] 網路連接是否正常

## 🎯 驗證部署成功

執行以下測試：

1. **訪問首頁**
   - ✅ 能看到猜測表單

2. **提交猜測**
   - ✅ 能成功提交姓名和性別
   - ✅ 跳轉到揭露頁面

3. **玩夾娃娃遊戲**
   - ✅ 能移動爪子
   - ✅ 能觸發夾取動畫
   - ✅ 能看到性別揭露彈窗

4. **查看統計**
   - ✅ 能看到統計數據
   - ✅ 數據會自動更新
   - ✅ 能看到猜對/猜錯名單

## 📞 需要幫助？

- 查看 Zeabur 服務日誌
- 檢查瀏覽器 Console 錯誤
- 檢查 Network 面板的 API 請求
