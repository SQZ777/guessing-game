# 移除 Cookie/Session - 改用名字驗證

## 📋 修改概述

完全移除了 cookie/session 機制，改用 **MongoDB + 名字** 來驗證重複猜測。這樣就不需要處理跨域 cookie 的問題了。

## ✅ 優點

1. ✅ **無跨域問題** - 不需要 cookie，完全避免跨域限制
2. ✅ **簡單直接** - 用名字識別用戶，邏輯更清晰
3. ✅ **用戶友善** - 名字存在 localStorage，刷新頁面不會丟失
4. ✅ **無隱私爭議** - 不使用第三方 cookie，符合隱私政策
5. ✅ **易於測試** - 直接用名字測試，不需要處理 cookie

## 🔄 主要變更

### 後端修改

#### 1. **guessController.js**
- ❌ 移除 session 檢查
- ✅ 改用 MongoDB 查詢名字是否已存在
- ✅ 名字查詢不區分大小寫

**檢查重複邏輯：**
```javascript
// 舊：檢查 session
if (req.session.hasGuessed) {
  return res.status(400).json({ error: '已經猜測過了' })
}

// 新：檢查 MongoDB
const existingGuess = await Guess.findOne({ 
  name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
})
if (existingGuess) {
  return res.status(400).json({ error: '此名字已經猜測過了' })
}
```

**檢查狀態 API：**
```javascript
// 舊：GET /api/guess/check (無參數，讀 session)
// 新：GET /api/guess/check?name=xxx (通過名字查詢)
```

#### 2. **revealController.js**
- ❌ 移除 session 讀取
- ✅ 改用 query parameter 接收名字
- ✅ 根據名字查詢猜測記錄

**API 變更：**
```javascript
// 舊：GET /api/reveal (從 session 讀取)
// 新：GET /api/reveal?name=xxx (通過名字查詢)
```

#### 3. **session.js & app.js**
- ⚠️ Session 配置保留（middleware/統計等可能還需要）
- ℹ️ 不影響現有功能，但猜測流程不再使用

### 前端修改

#### 1. **stores/guessStore.js**
- ✅ 新增 `userName` 狀態
- ✅ 使用 `localStorage` 保存用戶名
- ✅ API 調用改為傳遞名字參數

**狀態管理：**
```javascript
// 保存到 localStorage
const saveUserName = (name) => {
  userName.value = name
  localStorage.setItem('guessingGame_userName', name)
}

// 檢查狀態時傳遞名字
const checkGuessStatus = async (name) => {
  const response = await guessAPI.check(name)
  // ...
}
```

#### 2. **services/api.js**
- ✅ `check()` 改為 `check(name)` 並使用 query params
- ✅ `get()` 改為 `get(name)` 並使用 query params
- ✅ `markRevealed()` 支援通過名字標記

**API 變更：**
```javascript
// 舊
guessAPI.check() // 依賴 cookie
revealAPI.get()  // 依賴 cookie

// 新
guessAPI.check(name) // GET /api/guess/check?name=xxx
revealAPI.get(name)  // GET /api/reveal?name=xxx
```

#### 3. **views/GuessPage.vue**
- ✅ 初始化時從 store 讀取 userName
- ✅ 如果已猜測，自動跳轉到 reveal
- ✅ 提交成功後保存名字到 localStorage
- ❌ 移除 Storage Access API 相關代碼

#### 4. **views/RevealPage.vue**
- ✅ 從 store 讀取 userName
- ✅ 使用 userName 查詢揭露結果
- ✅ 沒有 userName 時跳轉回首頁

#### 5. **App.vue**
- ❌ 移除 CookieNotice 組件

### 已刪除文件

- ❌ `client/src/utils/storageAccess.js`
- ❌ `client/src/components/CookieNotice.vue`

## 🎯 工作流程

### 用戶首次訪問
```
1. 訪問首頁 (/)
2. 輸入名字和選擇性別
3. 點擊提交
   ↓
4. 後端檢查 MongoDB：此名字是否存在？
   - 不存在 → 創建記錄，返回成功
   - 存在 → 返回錯誤「此名字已經猜測過了」
   ↓
5. 前端保存名字到 localStorage
6. 跳轉到 /reveal
```

### 用戶再次訪問（刷新頁面）
```
1. 訪問首頁 (/)
2. 前端檢查 localStorage 是否有名字
   ↓
3. 有名字 → 調用 API 檢查狀態
   ↓
4. 已猜測 → 自動跳轉到 /reveal
```

### Reveal 頁面
```
1. 訪問 /reveal
2. 從 localStorage 讀取名字
   - 沒有名字 → 跳轉回首頁
   ↓
3. 調用 API：GET /api/reveal?name=xxx
4. 顯示揭曉結果
```

## 📊 API 對比

### 提交猜測
```bash
# 舊：依賴 session
POST /api/guess
Body: { "name": "test", "guess": "boy" }
Response: Set-Cookie header

# 新：純粹的 API 調用
POST /api/guess
Body: { "name": "test", "guess": "boy" }
Response: { "success": true, "data": { "guessId": "...", "name": "test", "guess": "boy" } }
```

### 檢查狀態
```bash
# 舊：讀取 session
GET /api/guess/check
Cookie: session=xxx

# 新：通過名字查詢
GET /api/guess/check?name=test
```

### 揭露結果
```bash
# 舊：讀取 session
GET /api/reveal
Cookie: session=xxx

# 新：通過名字查詢
GET /api/reveal?name=test
```

## 🔧 測試方式

### 1. 測試名字重複檢查
```bash
# 第一次提交（成功）
curl -X POST "https://sqz777-gussing-game-be.zeabur.app/api/guess" \
  -H "Content-Type: application/json" \
  -d '{"name":"測試用戶","guess":"boy"}'

# 第二次提交相同名字（失敗）
curl -X POST "https://sqz777-gussing-game-be.zeabur.app/api/guess" \
  -H "Content-Type: application/json" \
  -d '{"name":"測試用戶","guess":"girl"}'

# 預期返回：
# {"success":false,"error":"此名字已經猜測過了","hasGuessed":true}
```

### 2. 測試名字查詢
```bash
# 查詢已存在的名字
curl "https://sqz777-gussing-game-be.zeabur.app/api/guess/check?name=測試用戶"

# 預期返回：
# {"hasGuessed":true,"guessId":"...","revealed":false,"guess":"boy"}
```

### 3. 測試揭露
```bash
# 查詢揭露結果
curl "https://sqz777-gussing-game-be.zeabur.app/api/reveal?name=測試用戶"

# 預期返回：
# {"success":true,"data":{"gender":"boy","userGuess":"boy","isCorrect":true,"hasGuessed":true}}
```

### 4. 測試大小寫不敏感
```bash
# 提交
curl -X POST ".../api/guess" -d '{"name":"Test","guess":"boy"}'

# 查詢（小寫）
curl ".../api/guess/check?name=test"
# 預期：找到記錄

# 查詢（大寫）
curl ".../api/guess/check?name=TEST"
# 預期：找到記錄
```

## 🚀 部署步驟

```bash
# 1. 提交代碼
git add .
git commit -m "移除 cookie/session，改用名字驗證"
git push

# 2. Zeabur 自動部署
# 前端和後端都會自動重新部署

# 3. 清除瀏覽器數據（可選）
# DevTools → Application → Storage → Clear site data

# 4. 測試完整流程
```

## ⚠️ 注意事項

### 1. 名字唯一性
- 名字在資料庫中必須唯一（不區分大小寫）
- 如果兩個人想用相同名字，第二個人需要換名字

### 2. LocalStorage 限制
- localStorage 數據存在瀏覽器本地
- 清除瀏覽器數據會丟失
- 換瀏覽器/設備需要重新輸入名字

### 3. 隱私考慮
- 名字會存在 localStorage 中
- 任何人都可以用任意名字查詢猜測記錄
- 適合公開的遊戲，不適合需要隱私保護的場景

## 🎉 優化建議

### 可選：添加名字格式驗證
```javascript
// 限制名字長度和字符
if (name.length < 2 || name.length > 20) {
  return res.status(400).json({ error: '名字長度需在 2-20 個字符之間' })
}

if (!/^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/.test(name)) {
  return res.status(400).json({ error: '名字只能包含中文、英文、數字' })
}
```

### 可選：添加名字編輯功能
允許用戶修改自己的名字（需要額外的身份驗證機制）。

### 可選：添加「忘記名字」功能
提供一個界面讓用戶輸入名字來恢復狀態。

## 📝 總結

這次修改完全移除了 cookie/session 依賴，使用更簡單、更直接的方式：

- **識別用戶**：名字（存在 localStorage）
- **防重複**：MongoDB 名字唯一性檢查
- **狀態持久化**：MongoDB 資料庫

不再需要處理任何跨域 cookie 問題，部署更簡單，測試更容易！🎉
