const express = require('express');
const router = express.Router();
const { login, create, read, update, remove } = require('../controllers/category_controller');

const {verifyToken, isAdmin, isOperator} = require('../middlewares/verifyAuth');

router.get('/categories', verifyToken, read);
router.post('/category', verifyToken, isOperator, create);
router.put('/category/:id', verifyToken, isOperator, update);
router.delete('/category/:id', verifyToken, isAdmin, remove);

module.exports = router;