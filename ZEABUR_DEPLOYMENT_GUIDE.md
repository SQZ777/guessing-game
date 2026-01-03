# Zeabur 部署完整指南 - Cookie 跨域解決方案

## 🚨 問題診斷

你遇到的問題是：**Chrome 阻擋了第三方 Cookie**

從 curl 可以看到：
- ✅ 請求成功送達後端
- ❌ **沒有攜帶 Cookie header**
- ❌ 每次請求都是新的 session

## 📋 完整部署步驟

### 步驟 1️⃣：提交並推送代碼到 Git

```bash
# 在本地專案目錄執行
git add .
git commit -m "修復跨域 session cookie 問題"
git push origin main
```

### 步驟 2️⃣：設定 Zeabur 後端環境變數

登入 Zeabur Dashboard → 選擇後端服務 → Environment Variables

添加/修改以下變數：
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
SESSION_SECRET=your-random-secret-key-at-least-32-chars
ADMIN_TOKEN=your-admin-token
ACTUAL_GENDER=boy
FRONTEND_URL=https://sqz777.zeabur.app
```

**重要：** `FRONTEND_URL` 必須設定！這會讓 cookie domain 設為 `.zeabur.app`

### 步驟 3️⃣：設定 Zeabur 前端環境變數

前端服務 → Environment Variables

```env
VITE_API_URL=https://sqz777-gussing-game-be.zeabur.app/api
```

### 步驟 4️⃣：重新部署

Zeabur 會自動檢測到 Git 更新並重新部署，或手動觸發重新部署。

### 步驟 5️⃣：驗證部署

**5.1 檢查後端日誌**

在 Zeabur 後端服務的 Logs 中應該看到：
```
Session Cookie Domain: .zeabur.app
環境配置:
- NODE_ENV: production
- FRONTEND_URL: https://sqz777.zeabur.app
- Trust Proxy: true
```

**5.2 測試 API**

```bash
# 測試 reveal 端點（應該返回新的格式）
curl "https://sqz777-gussing-game-be.zeabur.app/api/reveal"

# 預期返回：
{
  "success": true,
  "data": {
    "gender": "boy",
    "hasGuessed": false
  }
}
```

### 步驟 6️⃣：清除瀏覽器 Cookie

1. 打開 Chrome DevTools (F12)
2. Application → Cookies
3. 刪除所有 `*.zeabur.app` 相關的 cookies
4. 或使用無痕模式測試

### 步驟 7️⃣：測試完整流程

1. **訪問首頁**
   ```
   https://sqz777.zeabur.app/
   ```

2. **打開 DevTools → Network**

3. **提交猜測**
   - 輸入名字和選擇性別
   - 點擊提交
   - **檢查 Response Headers**，應該看到：
   ```
   Set-Cookie: gender_guess_session=...; Domain=.zeabur.app; Path=/; HttpOnly; Secure; SameSite=None
   ```

4. **檢查下一個請求**
   - 查看後續的 request headers
   - 應該會看到 `Cookie: gender_guess_session=...`

5. **訪問 Reveal 頁面**
   - 應該能正確顯示揭曉畫面
   - 如果仍然跳回首頁，代表 cookie 還是沒有被發送

## 🔧 如果仍然無法工作

### 方法 A：檢查 Chrome Cookie 設定

1. Chrome 設定 → 隱私權和安全性 → Cookie 和其他網站資料
2. 確認**不是**選擇「封鎖所有 Cookie」
3. 建議選擇：「允許所有 Cookie」或「在無痕模式中封鎖第三方 Cookie」

### 方法 B：使用 Chrome Flags 強制允許

訪問：`chrome://flags/#test-third-party-cookie-phaseout`
設為：`Disabled`

重啟 Chrome

### 方法 C：使用其他瀏覽器測試

- Firefox
- Safari  
- Edge

看看是否是 Chrome 特定問題

## 🐛 調試技巧

### 1. 檢查 Cookie 是否被設定

DevTools → Application → Cookies → `https://sqz777-gussing-game-be.zeabur.app`

應該看到：
```
Name: gender_guess_session
Value: s%3A...
Domain: .zeabur.app
Path: /
Expires: (7天後)
HttpOnly: ✓
Secure: ✓
SameSite: None
```

### 2. 檢查請求是否攜帶 Cookie

DevTools → Network → 選擇任一 API 請求 → Request Headers

應該看到：
```
Cookie: gender_guess_session=s%3A...
```

### 3. 檢查後端日誌

Zeabur 後端 Logs 應該顯示：
```
=== Request ===
URL: POST /api/guess
Cookie: gender_guess_session=s%3A...
SessionID: 相同的ID
Session: { hasGuessed: true, guessId: '...' }
```

如果看到 `Cookie: undefined`，表示瀏覽器沒有發送 cookie。

## 📝 常見問題

### Q: 為什麼需要設定 `FRONTEND_URL`？

A: 後端會從這個 URL 提取 domain (`.zeabur.app`)，並設定到 session cookie 的 domain 屬性。這樣所有 `*.zeabur.app` 的子域名都能共享這個 cookie。

### Q: 為什麼不能用 Zeabur 內部網路？

A: 因為前端使用 HTTPS，而內部網路是 HTTP，瀏覽器會阻擋混合內容（Mixed Content）。

### Q: Session cookie 的 SameSite=None 安全嗎？

A: 配合 `Secure=true` 和 `HttpOnly=true` 是安全的。這是跨域 cookie 的標準做法。

### Q: 可以不用 cookie 嗎？

A: 可以，但需要大幅修改架構：
- 使用 JWT token 存在 localStorage
- 修改所有 API 使用 Bearer token 認證
- 但這會失去 session 的安全優勢

## ✅ 驗證成功的標誌

1. ✅ 提交猜測後，Network 顯示 `Set-Cookie` header
2. ✅ 後續請求都攜帶 `Cookie` header
3. ✅ 後端日誌顯示相同的 SessionID
4. ✅ Reveal 頁面能正確顯示結果
5. ✅ 統計頁面能看到所有猜測記錄

## 🎯 預期結果

完成所有步驟後：

```bash
# 1. 檢查狀態（無 cookie）
curl "https://sqz777-gussing-game-be.zeabur.app/api/guess/check"
# {"hasGuessed":false}

# 2. 提交猜測（獲得 cookie）
curl -i -X POST "https://sqz777-gussing-game-be.zeabur.app/api/guess" \
  -H "Content-Type: application/json" \
  -d '{"name":"測試","guess":"boy"}' \
  --cookie-jar cookies.txt

# 應該看到 Set-Cookie header：
# Set-Cookie: gender_guess_session=...; Domain=.zeabur.app; ...

# 3. 使用 cookie 檢查狀態
curl "https://sqz777-gussing-game-be.zeabur.app/api/guess/check" \
  --cookie cookies.txt
# {"hasGuessed":true,"guessId":"...","revealed":false}

# 4. 使用 cookie 訪問 reveal
curl "https://sqz777-gussing-game-be.zeabur.app/api/reveal" \
  --cookie cookies.txt
# {"success":true,"data":{"gender":"boy","userGuess":"boy","isCorrect":true,"hasGuessed":true}}
```

在瀏覽器中，cookie 會自動處理，不需要手動管理。
