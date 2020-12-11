const express = require('express');
const router = express.Router();
const { read, create, update, remove,exelToDB,makeReport,readById } = require('../controllers/spj_controller');

const {upload} = require('../middlewares/fileUpload');
const {uploadExel} = require('../middlewares/uploadExelToDB');
const {verifyToken, isAdmin, isOperator} = require('../middlewares/verifyAuth');

router.get('/spjs', verifyToken, read);
router.post('/spj', verifyToken, isOperator, upload.single('dok_file'),create);
router.get('/spj/report', verifyToken, makeReport);
router.post('/spj/exeltodb', verifyToken, isOperator, uploadExel.single('exel_file'),exelToDB);
router.get('/spj/:id', verifyToken, isOperator, readById);
router.put('/spj/:id', verifyToken, isOperator, upload.single('dok_file'), update);
router.delete('/spj/:id', verifyToken, isAdmin, remove);

module.exports = router;