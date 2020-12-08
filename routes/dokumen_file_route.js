const express = require('express');
const router = express.Router();
const {  sendFile } = require('../controllers/dokumen_file_controller');

router.get('/document/file/:id', sendFile);

module.exports = router;


