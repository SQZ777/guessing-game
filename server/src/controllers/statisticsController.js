const Guess = require('../models/Guess');
const Setting = require('../models/Setting');

// 取得統計數據
exports.getStatistics = async (req, res) => {
  try {
    // 取得實際性別
    const actualGender = await Setting.getValue('actualGender', process.env.ACTUAL_GENDER || 'boy');

    // 取得所有已揭露的猜測
    const allGuesses = await Guess.find({ revealed: true }).sort({ createdAt: -1 });

    // 計算統計數據
    const totalGuesses = allGuesses.length;
    const boyGuesses = allGuesses.filter(g => g.guess === 'boy').length;
    const girlGuesses = allGuesses.filter(g => g.guess === 'girl').length;

    // 分類正確和錯誤的猜測
    const correctList = allGuesses
      .filter(g => g.guess === actualGender)
      .map(g => ({ name: g.name, guess: g.guess }));

    const incorrectList = allGuesses
      .filter(g => g.guess !== actualGender)
      .map(g => ({ name: g.name, guess: g.guess }));

    const correctCount = correctList.length;
    const incorrectCount = incorrectList.length;

    res.json({
      success: true,
      data: {
        actualGender,
        totalGuesses,
        statistics: {
          boyGuesses,
          girlGuesses,
          boyPercentage: totalGuesses > 0 ? Math.round((boyGuesses / totalGuesses) * 100) : 0,
          girlPercentage: totalGuesses > 0 ? Math.round((girlGuesses / totalGuesses) * 100) : 0,
          correctCount,
          incorrectCount,
          correctPercentage: totalGuesses > 0 ? Math.round((correctCount / totalGuesses) * 100) : 0
        },
        lists: {
          correct: correctList,
          incorrect: incorrectList
        }
      }
    });
  } catch (error) {
    console.error('取得統計數據錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器錯誤'
    });
  }
};

// 管理員設定性別
exports.setGender = async (req, res) => {
  try {
    const { gender } = req.body;
    const authHeader = req.headers.authorization;

    // 驗證管理員 token
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
      return res.status(401).json({
        success: false,
        error: '未授權'
      });
    }

    // 驗證性別值
    if (!gender || !['boy', 'girl'].includes(gender)) {
      return res.status(400).json({
        success: false,
        error: '請提供有效的性別值 (boy 或 girl)'
      });
    }

    // 更新設定
    await Setting.setValue('actualGender', gender);

    // 更新所有已揭露猜測的 isCorrect 狀態
    const allGuesses = await Guess.find({ revealed: true });
    for (const guess of allGuesses) {
      guess.checkCorrect(gender);
      await guess.save();
    }

    res.json({
      success: true,
      message: `性別已設定為${gender === 'boy' ? '男生' : '女生'}`
    });
  } catch (error) {
    console.error('設定性別錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器錯誤'
    });
  }
};
