const Guess = require('../models/Guess');
const Setting = require('../models/Setting');

// 取得揭露結果
exports.getReveal = async (req, res) => {
  try {
    // 取得實際性別
    const actualGender = await Setting.getValue('actualGender', process.env.ACTUAL_GENDER || 'boy');

    // 如果有 session 記錄，返回完整資訊
    if (req.session.hasGuessed && req.session.guessId) {
      // 取得使用者的猜測
      const guess = await Guess.findById(req.session.guessId);
      if (guess) {
        // 計算是否猜對
        const isCorrect = guess.guess === actualGender;

        return res.json({
          success: true,
          data: {
            gender: actualGender,
            userGuess: guess.guess,
            isCorrect,
            hasGuessed: true
          }
        });
      }
    }

    // 沒有 session 或找不到猜測記錄，只返回實際性別
    res.json({
      success: true,
      data: {
        gender: actualGender,
        hasGuessed: false
      }
    });
  } catch (error) {
    console.error('取得揭露結果錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器錯誤'
    });
  }
};
