const express = require('express');
const router = express.Router();
const {readSPJ} = require('../controllers/spj_controller');

router.get('/spj', readSPJ);

module.exports = router;