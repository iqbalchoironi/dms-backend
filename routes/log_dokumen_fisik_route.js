const express = require('express');
const router = express.Router();
const { create, read, update, remove, makeReport } = require('../controllers/log_dokumen_fisik_controller');
const {verifyToken, isAdmin, isOperator} = require('../middlewares/verifyAuth');
router.get('/document/logs', verifyToken, read);
router.get('/document/log/report', verifyToken, makeReport);
router.post('/document/log', verifyToken, isOperator, create);
router.put('/document/log/:id', verifyToken, isOperator, update);
router.delete('/document/log/:id', verifyToken, isAdmin, remove);


module.exports = router;