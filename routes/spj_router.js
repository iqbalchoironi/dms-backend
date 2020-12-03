const express = require('express');
const router = express.Router();
const { read, create, update, remove } = require('../controllers/spj_controller');

router.get('/spjs', read);
router.post('/spj', create);
router.put('/spj/:id', update);
router.delete('/spj/:id', remove);

module.exports = router;