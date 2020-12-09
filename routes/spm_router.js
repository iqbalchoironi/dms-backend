const express = require('express');
const router = express.Router();
const { read, create, update, remove, exelToDB, makeReport, readById } = require('../controllers/spm_controller');

const {upload} = require('../middlewares/fileUpload');
const {uploadExel} = require('../middlewares/uploadExelToDB');

router.get('/spms', read);
router.post('/spm', upload.single('dok_file'),create);
router.get('/spm/report', makeReport);
router.post('/spm/exeltodb', uploadExel.single('exel_file'),exelToDB);
router.get('/spm/:id', readById);
router.put('/spm/:id',upload.single('dok_file'), update);
router.delete('/spm/:id', remove);

module.exports = router;