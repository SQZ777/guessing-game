const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
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
    // 不設定 domain，讓瀏覽器自動處理
    path: '/'
  }
};

module.exports = sessionConfig;
