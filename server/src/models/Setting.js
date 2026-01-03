const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

// 靜態方法：取得設定值
settingSchema.statics.getValue = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// 靜態方法：設定值
settingSchema.statics.setValue = async function(key, value) {
  return await this.findOneAndUpdate(
    { key },
    { key, value },
    { upsert: true, new: true }
  );
};

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
