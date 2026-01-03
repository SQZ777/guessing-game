const Guess = require('../models/Guess');
const Setting = require('../models/Setting');

// 取得揭露結果（通過名字）
exports.getReveal = async (req, res) => {
  try {
    const { name } = req.query;

    // 取得實際性別
    const actualGender = await Setting.getValue('actualGender', process.env.ACTUAL_GENDER || 'boy');

    // 如果有提供名字，查找該名字的猜測記錄
    if (name && name.trim().length > 0) {
      const guess = await Guess.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
      });

      if (guess) {
        // 計算是否猜對
        const isCorrect = guess.guess === actualGender;

        return res.json({
          success: true,
          data: {
            gender: actualGender,
            userGuess: guess.guess,
            isCorrect,
            hasGuessed: true,
            guessId: guess._id
          }
        });
      }
    }

    // 沒有提供名字或找不到猜測記錄，只返回實際性別
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
