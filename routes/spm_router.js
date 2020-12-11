const express = require('express');
const router = express.Router();
const { read, create, update, remove, exelToDB, makeReport, readById } = require('../controllers/spm_controller');

const {upload} = require('../middlewares/fileUpload');
const {uploadExel} = require('../middlewares/uploadExelToDB');
const {verifyToken, isAdmin, isOperator} = require('../middlewares/verifyAuth');

router.get('/spms', verifyToken, read);
router.post('/spm', verifyToken,isOperator, upload.single('dok_file'),create);
router.get('/spm/report', verifyToken, makeReport);
router.post('/spm/exeltodb',verifyToken, isOperator, uploadExel.single('exel_file'),exelToDB);
router.get('/spm/:id',verifyToken, readById);
router.put('/spm/:id',verifyToken, isOperator, upload.single('dok_file'), update);
router.delete('/spm/:id', verifyToken, isAdmin, remove);

module.exports = router;