const express = require('express');
const router = express.Router();

const guessController = require('../controllers/guessController');
const revealController = require('../controllers/revealController');
const statisticsController = require('../controllers/statisticsController');

// 猜測相關路由
router.post('/guess', guessController.createGuess);
router.get('/guess/check', guessController.checkGuess);
router.put('/guess/:guessId/revealed', guessController.markRevealed);

// 揭露相關路由
router.get('/reveal', revealController.getReveal);

// 統計相關路由
router.get('/statistics', statisticsController.getStatistics);

// 管理員路由
router.post('/admin/set-gender', statisticsController.setGender);

module.exports = router;
