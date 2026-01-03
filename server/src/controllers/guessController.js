const Guess = require('../models/Guess');
const Setting = require('../models/Setting');

// 提交猜測
exports.createGuess = async (req, res) => {
  try {
    const { name, guess } = req.body;

    // 檢查是否已經猜測過
    if (req.session.hasGuessed) {
      return res.status(400).json({
        success: false,
        error: '已經猜測過了'
      });
    }

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

    // 建立猜測記錄
    const newGuess = await Guess.create({
      name: name.trim(),
      guess,
      sessionId: req.sessionID
    });

    // 更新 session
    req.session.hasGuessed = true;
    req.session.guessId = newGuess._id.toString();
    req.session.revealed = false;

    console.log('準備保存 session:', {
      sessionID: req.sessionID,
      hasGuessed: req.session.hasGuessed,
      guessId: req.session.guessId
    });

    // 明確保存 session（確保 Set-Cookie 被發送）
    req.session.save((err) => {
      if (err) {
        console.error('Session 保存錯誤:', err);
        return res.status(500).json({
          success: false,
          error: '伺服器錯誤'
        });
      }

      console.log('Session 保存成功！');
      
      res.status(201).json({
        success: true,
        data: {
          guessId: newGuess._id,
          name: newGuess.name,
          guess: newGuess.guess
        }
      });
    });
  } catch (error) {
    console.error('建立猜測錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器錯誤'
    });
  }
};

// 檢查是否已猜測
exports.checkGuess = async (req, res) => {
  try {
    if (req.session.hasGuessed && req.session.guessId) {
      const guess = await Guess.findById(req.session.guessId);
      
      if (guess) {
        return res.json({
          hasGuessed: true,
          guessId: guess._id,
          revealed: guess.revealed
        });
      }
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

// 標記已揭露
exports.markRevealed = async (req, res) => {
  try {
    const { guessId } = req.params;

    // 驗證是否為本人的猜測
    if (req.session.guessId !== guessId) {
      return res.status(403).json({
        success: false,
        error: '無權限操作'
      });
    }

    // 取得實際性別
    const actualGender = await Setting.getValue('actualGender', process.env.ACTUAL_GENDER || 'boy');

    // 更新猜測記錄
    const guess = await Guess.findById(guessId);
    if (!guess) {
      return res.status(404).json({
        success: false,
        error: '找不到猜測記錄'
      });
    }

    guess.revealed = true;
    guess.checkCorrect(actualGender);
    await guess.save();

    // 更新 session
    req.session.revealed = true;

    // 明確保存 session
    req.session.save((err) => {
      if (err) {
        console.error('Session 保存錯誤:', err);
        return res.status(500).json({
          success: false,
          error: '伺服器錯誤'
        });
      }

      res.json({
        success: true
      });
    });
  } catch (error) {
    console.error('標記揭露錯誤:', error);
    res.status(500).json({
      success: false,
      error: '伺服器錯誤'
    });
  }
};
