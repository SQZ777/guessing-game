# Session Cookie 跨域問題修復指南

## 🔍 問題診斷

從 log 可以看到：
- 每次請求都有不同的 SessionID
- `Cookie: undefined` - 瀏覽器沒有發送 cookie
- Session 無法保持，導致 reveal 頁面無法取得用戶的猜測記錄

## 🎯 根本原因

在 Zeabur 部署時，前端和後端使用不同域名：
- 前端：`https://sqz777.zeabur.app`
- 後端：`https://sqz777-gussing-game-be.zeabur.app`

這是**跨域請求**，瀏覽器的安全策略會阻止第三方 cookie，即使設定了 `sameSite: 'none'` 和 `secure: true` 也可能被阻擋。

## ✅ 解決方案（推薦）

### 使用 Cookie Domain 配置（最終解決方案）⭐

設定 cookie domain 為 `.zeabur.app`，這樣所有 `*.zeabur.app` 子域名都能共享 cookie。

**步驟：**

1. **在 Zeabur 後端服務設定環境變數：**
   ```env
   NODE_ENV=production
   MONGODB_URI=<你的 MongoDB 連線>
   SESSION_SECRET=<隨機密鑰>
   FRONTEND_URL=https://sqz777.zeabur.app
   ```
   - `FRONTEND_URL` 必須設定！後端會自動提取 domain (`.zeabur.app`)

2. **在 Zeabur 前端服務設定環境變數：**
   ```env
   VITE_API_URL=https://sqz777-gussing-game-be.zeabur.app/api
   ```
   - 使用後端的公開 HTTPS 域名

3. **重新部署兩個服務**

4. **清除瀏覽器 cookie 後測試**

**原理：**
- Cookie domain 設為 `.zeabur.app`
- 前端 `sqz777.zeabur.app` 和後端 `sqz777-gussing-game-be.zeabur.app` 都在此 domain 下
- Cookie 可以在子域名之間共享
- 使用 HTTPS 避免混合內容問題

**優點：**
- ✅ 完全解決 cookie 跨域問題
- ✅ 使用 HTTPS（安全）
- ✅ 不需要內部網路（避免混合內容問題）
- ✅ 後端可公開訪問（方便調試）

### ~~方案 1：使用 Zeabur 內部網路~~（已棄用）

⚠️ **此方案有混合內容問題**：前端 HTTPS 無法訪問內部 HTTP。

### 方案 2：後端設定為前端的子域名

將後端綁定到前端的子域名：
- 前端：`https://sqz777.zeabur.app`
- 後端：`https://api.sqz777.zeabur.app`

這樣可以使用 `sameSite: 'lax'` 而不需要 `'none'`。

**需要：**
- 有自己的域名
- 在 Zeabur 和域名服務商設定 DNS

### 方案 3：已經實施的代碼修改

我已經做了以下修改：

1. **Session 配置** ([session.js](server/src/config/session.js#L5-L22))
   - 改為 `saveUninitialized: true`
   - 添加 `proxy: true`

2. **App 配置** ([app.js](server/src/app.js#L16))
   - 添加 `app.set('trust proxy', 1)`

3. **Reveal API** ([revealController.js](server/src/controllers/revealController.js#L5-L39))
   - 改為允許無 session 訪問
   - 返回基本的性別資訊

**注意：** 這只是臨時方案，無法完全解決 cookie 問題

## 🚀 推薦配置

**立即執行：**

1. 確認後端服務名稱：
   - 登入 Zeabur Dashboard
   - 找到後端服務，記下服務名稱

2. 設定前端環境變數：
   ```env
   VITE_API_URL=http://<你的後端服務名稱>.zeabur.internal:3000/api
   ```

3. 重新部署前端

4. 清除瀏覽器 cookie 並測試

## 🔧 測試方法

```bash
# 測試 1：提交猜測
curl -i -X POST "https://sqz777-gussing-game-be.zeabur.app/api/guess" \
  -H "Content-Type: application/json" \
  -d '{"name":"測試","guess":"boy"}' \
  --cookie-jar cookies.txt

# 測試 2：使用相同的 cookie 訪問 reveal
curl -i "https://sqz777-gussing-game-be.zeabur.app/api/reveal" \
  --cookie cookies.txt

# 應該會看到 hasGuessed: true 和完整的資訊
```

## 📋 檢查清單

- [ ] 確認使用 Zeabur 內部網路（方案 1）
- [ ] 設定正確的 `VITE_API_URL`
- [ ] 重新部署前端服務
- [ ] 清除瀏覽器 cookie
- [ ] 測試完整流程：猜測 → 揭露 → 統計

## ⚠️ 重要提醒

如果仍然使用公開的跨域 API（`https://sqz777-gussing-game-be.zeabur.app`），Cookie 可能會被 Chrome 的隱私設定阻擋，特別是：
- Chrome 的「阻擋第三方 Cookie」功能
- 隱私沙盒（Privacy Sandbox）
- HTTPS 混合內容限制

**最佳解決方案就是使用 Zeabur 內部網路！**
