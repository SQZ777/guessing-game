/**
 * Storage Access API - 請求第三方 Cookie 訪問權限
 * 用於解決 Chrome 阻擋跨域 Cookie 的問題
 */

export class StorageAccessManager {
  constructor() {
    this.hasAccess = false
    this.checkingAccess = false
  }

  /**
   * 檢查瀏覽器是否支援 Storage Access API
   */
  isSupported() {
    return 'requestStorageAccess' in document && 
           'hasStorageAccess' in document
  }

  /**
   * 檢查是否已有訪問權限
   */
  async checkAccess() {
    if (!this.isSupported()) {
      console.log('瀏覽器不支援 Storage Access API，使用傳統 Cookie')
      return true // 假設傳統瀏覽器會允許
    }

    try {
      this.hasAccess = await document.hasStorageAccess()
      console.log('Storage Access 狀態:', this.hasAccess)
      return this.hasAccess
    } catch (error) {
      console.error('檢查 Storage Access 失敗:', error)
      return false
    }
  }

  /**
   * 請求訪問權限（必須在用戶互動中調用）
   */
  async requestAccess() {
    if (!this.isSupported()) {
      return true
    }

    if (this.checkingAccess) {
      console.log('已在請求訪問權限中...')
      return false
    }

    try {
      this.checkingAccess = true
      
      // 先檢查是否已有權限
      const hasAccess = await this.checkAccess()
      if (hasAccess) {
        console.log('已有 Storage Access 權限')
        return true
      }

      // 請求權限
      console.log('請求 Storage Access 權限...')
      await document.requestStorageAccess()
      
      this.hasAccess = true
      console.log('Storage Access 權限已授予')
      return true
    } catch (error) {
      console.error('請求 Storage Access 失敗:', error)
      // 顯示友善的錯誤提示
      this.showAccessDeniedHint()
      return false
    } finally {
      this.checkingAccess = false
    }
  }

  /**
   * 顯示訪問被拒絕的提示
   */
  showAccessDeniedHint() {
    console.warn(`
🔒 Cookie 訪問受限

您的瀏覽器阻擋了第三方 Cookie，這可能影響功能正常運作。

解決方法：
1. Chrome 設定 → 隱私權和安全性 → Cookie 和其他網站資料
2. 選擇「允許所有 Cookie」或「在無痕模式中封鎖第三方 Cookie」
3. 重新載入頁面

或使用無痕模式測試
    `)
  }

  /**
   * 在用戶互動時自動請求權限
   * 包裝函數，確保在用戶操作中請求權限
   */
  async withStorageAccess(callback) {
    try {
      // 先請求權限（如果需要）
      await this.requestAccess()
      
      // 執行回調
      return await callback()
    } catch (error) {
      console.error('執行操作時發生錯誤:', error)
      throw error
    }
  }
}

// 創建單例
export const storageAccessManager = new StorageAccessManager()

// 初始化檢查
storageAccessManager.checkAccess()
