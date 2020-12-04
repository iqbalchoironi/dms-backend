const express = require('express');
const router = express.Router();
const { login, create, read, update, remove } = require('../controllers/category_controller');

router.get('/categories', read);
router.post('/category', create);
router.put('/category/:id', update);
router.delete('/category/:id', remove);

module.exports = router;