const express = require('express');
const router = express.Router();
const { read, create, update, remove, exelToDB } = require('../controllers/spm_controller');

const {upload} = require('../middlewares/fileUpload');
const {uploadExel} = require('../middlewares/uploadExelToDB');

router.get('/spms', read);
router.post('/spm', upload.single('dok_file'),create);
router.put('/spm/:id',upload.single('dok_file'), update);
router.delete('/spm/:id', remove);
router.post('/spm/exeltodb', uploadExel.single('exel_file'),exelToDB);

module.exports = router;