const express = require('express');
const router = express.Router();
const { read, create, update, remove, sendFile } = require('../controllers/spm_controller');

const {upload} = require('../middlewares/fileUpload');

router.get('/spms', read);
router.post('/spm', upload.single('dok_file'),create);
router.put('/spm/:id',upload.single('dok_file'), update);
router.delete('/spm/:id', remove);

module.exports = router;