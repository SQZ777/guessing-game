const Guess = require('../models/Guess');
const Setting = require('../models/Setting');

// 取得揭露結果
exports.getReveal = async (req, res) => {
  try {
    // 檢查是否有猜測記錄
    if (!req.session.hasGuessed || !req.session.guessId) {
      return res.status(400).json({
        success: false,
        error: '尚未進行猜測'
      });
    }

    // 取得使用者的猜測
    const guess = await Guess.findById(req.session.guessId);
    if (!guess) {
      return res.status(404).json({
        success: false,
        error: '找不到猜測記錄'
      });
    }

    // 取得實際性別
    const actualGender = await Setting.getValue('actualGender', process.env.ACTUAL_GENDER || 'boy');

    // 計算是否猜對
    const isCorrect = guess.guess === actualGender;

    res.json({
      success: true,
      data: {
        gender: actualGender,
        userGuess: guess.guess,
        isCorrect
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
