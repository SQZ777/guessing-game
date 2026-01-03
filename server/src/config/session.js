const session = require('express-session');
const MongoStore = require('connect-mongo');

// 從環境變數取得前端 URL 並提取 domain
const getFrontendDomain = () => {
  if (process.env.FRONTEND_URL) {
    try {
      const url = new URL(process.env.FRONTEND_URL);
      // 提取主域名（例如：zeabur.app）
      const parts = url.hostname.split('.');
      if (parts.length >= 2) {
        return '.' + parts.slice(-2).join('.'); // .zeabur.app
      }
    } catch (e) {
      console.error('解析 FRONTEND_URL 失敗:', e);
    }
  }
  return undefined;
};

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: true,
  name: 'gender_guess_session',
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 7 * 24 * 60 * 60, // 7 天
    autoRemove: 'native'
  }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    domain: getFrontendDomain() // 動態設定 domain
  },
  proxy: true
};

console.log('Session Cookie Domain:', sessionConfig.cookie.domain);

module.exports = sessionConfig;
