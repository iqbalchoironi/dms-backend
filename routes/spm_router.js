const express = require('express');
const router = express.Router();
const { read, create, update, remove } = require('../controllers/spm_controller');

router.get('/spms', read);
router.post('/spm', create);
router.put('/spm/:id', update);
router.delete('/spm/:id', remove);

module.exports = router;