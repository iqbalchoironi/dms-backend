const express = require('express');
const router = express.Router();
const { read, makeReport, remove } = require('../controllers/log_activity');
const {verifyToken, isAdmin, isOperator} = require('../middlewares/verifyAuth');

router.get('/logs', verifyToken, read);
router.delete('/log/:id', verifyToken, isAdmin, remove);
router.get('/log/report',verifyToken, makeReport);

module.exports = router;