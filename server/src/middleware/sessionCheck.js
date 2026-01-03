// 檢查 Session 的 Middleware
const sessionCheck = (req, res, next) => {
  // 這裡可以添加額外的 session 驗證邏輯
  next();
};

// 需要已猜測的 Middleware
const requireGuessed = (req, res, next) => {
  if (!req.session.hasGuessed || !req.session.guessId) {
    return res.status(401).json({
      success: false,
      error: '請先進行猜測'
    });
  }
  next();
};

module.exports = {
  sessionCheck,
  requireGuessed
};
