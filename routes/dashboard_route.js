const express = require('express');
const router = express.Router();
const { read } = require('../controllers/dashboard_controller');
const { verifyToken } = require('../middlewares/verifyAuth');

router.get('/dashboard', verifyToken, read);

module.exports = router;