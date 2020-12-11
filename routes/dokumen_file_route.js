const express = require('express');
const router = express.Router();
const {  sendFile } = require('../controllers/dokumen_file_controller');
const {verifyToken, isAdmin, isOperator} = require('../middlewares/verifyAuth');
router.get('/document/file/:id', verifyToken, sendFile);

module.exports = router;


