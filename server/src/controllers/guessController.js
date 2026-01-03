const Guess = require('../models/Guess');
const Setting = require('../models/Setting');

// 提交猜測
exports.createGuess = async (req, res) => {
  try {
    const { name, guess } = req.body;

    // 驗證輸入
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '請輸入姓名'
      });
    }

    if (!guess || !['boy', 'girl'].includes(guess)) {
      return res.status(400).json({
        success: false,
        error: '請選擇有效的性別'
      });
    }

    const trimmedName = name.trim();

    // 檢查名字是否已經猜測過（不區分大小寫）
    const existingGuess = await Guess.findOne({ 
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
    });

    if (existingGuess) {
      return res.status(400).json({
        success: false,
        error: '此名字已經猜測過了',
        hasGuessed: true,
        data: {
          guessId: existingGuess._id,
          name: existingGuess.name,
          guess: existingGuess.guess,
          revealed: existingGuess.revealed
        }
      });
    }

    // 建立猜測記錄
    const newGuess = await Guess.create({
      name: trimmedName,
      guess
    });

    console.log('新猜測記錄:', {
      guessId: newGuess._id,
      name: newGuess.name,
      guess: newGuess.guess
    });

    res.status(201).json({
      success: true,
      data: {
        guessId: newGuess._id,
        name: newGuess.name,
        guess: newGuess.guess
      }
    });
  } catch (error) {
    console.error('建立猜測錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器錯誤'
    });
  }
};

// 檢查是否已猜測（通過名字）
exports.checkGuess = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim().length === 0) {
      return res.json({
        hasGuessed: false
      });
    }

    // 查找名字對應的猜測記錄（不區分大小寫）
    const guess = await Guess.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (guess) {
      return res.json({
        hasGuessed: true,
        guessId: guess._id,
        revealed: guess.revealed,
        guess: guess.guess
      });
    }

    res.json({
      hasGuessed: false
    });
  } catch (error) {
    console.error('檢查猜測錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器錯誤'
    });
  }
};

// 標記已揭露（通過名字或 guessId）
exports.markRevealed = async (req, res) => {
  try {
    const { guessId } = req.params;
    const { name } = req.body;

    let guess;

    // 優先使用 guessId，否則使用名字
    if (guessId) {
      guess = await Guess.findById(guessId);
    } else if (name) {
      guess = await Guess.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
      });
    }

    if (!guess) {
      return res.status(404).json({
        success: false,
        error: '找不到猜測記錄'
      });
    }

    // 取得實際性別
    const actualGender = await Setting.getValue('actualGender', process.env.ACTUAL_GENDER || 'boy');

    // 更新猜測記錄
    guess.revealed = true;
    guess.checkCorrect(actualGender);
    await guess.save();

    res.json({
      success: true,
      data: {
        guessId: guess._id,
        revealed: true
      }
    });
  } catch (error) {
    console.error('標記揭露錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器錯誤'
    });
  }
};
