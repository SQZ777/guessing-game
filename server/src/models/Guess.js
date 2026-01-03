const mongoose = require('mongoose');

const guessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '姓名為必填'],
    trim: true,
    minlength: [1, '姓名至少需要 1 個字元']
  },
  guess: {
    type: String,
    required: [true, '請選擇猜測的性別'],
    enum: ['boy', 'girl']
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  revealed: {
    type: Boolean,
    default: false
  },
  isCorrect: {
    type: Boolean,
    default: null
  }
}, {
  timestamps: true
});

// 計算是否猜對的方法
guessSchema.methods.checkCorrect = function(actualGender) {
  this.isCorrect = this.guess === actualGender;
  return this.isCorrect;
};

const Guess = mongoose.model('Guess', guessSchema);

module.exports = Guess;
