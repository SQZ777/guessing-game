require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');

const connectDB = require('./config/database');
const sessionConfig = require('./config/session');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// 連接資料庫
connectDB();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // 允許的來源列表
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL, // Zeabur 前端 URL
    ].filter(Boolean); // 移除 undefined 值

    // 允許沒有 origin 的請求（如 Postman、伺服器端請求）
    if (!origin) return callback(null, true);
    
    // 允許所有 .zeabur.app 域名（開發/測試方便）
    if (origin.includes('.zeabur.app')) {
      return callback(null, true);
    }

    // 檢查是否在允許列表中
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('CORS 拒絕來源:', origin);
      callback(new Error('不允許的 CORS 來源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session(sessionConfig));

// API 路由
app.use('/api', routes);

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Session 調試端點（僅用於開發）
app.get('/debug/session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    session: req.session,
    cookies: req.headers.cookie,
    hasGuessed: req.session.hasGuessed || false,
    guessId: req.session.guessId || null
  });
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '找不到該資源'
  });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('伺服器錯誤:', err);
  res.status(500).json({
    success: false,
    error: '伺服器內部錯誤'
  });
});

app.listen(PORT, () => {
  console.log(`伺服器運行在 http://localhost:${PORT}`);
  console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
});
