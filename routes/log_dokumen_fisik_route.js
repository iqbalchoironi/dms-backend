const express = require('express');
const router = express.Router();
const { create, read, update, remove } = require('../controllers/log_dokumen_fisik_controller');

router.get('/document/logs', read);
router.post('/document/log', create);
router.put('/document/log/:id', update);
router.delete('/document/log/:id', remove);

module.exports = router;