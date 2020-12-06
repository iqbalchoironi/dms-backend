const express = require('express');
const router = express.Router();
const { read } = require('../controllers/log_activity');

router.get('/logs', read);

module.exports = router;