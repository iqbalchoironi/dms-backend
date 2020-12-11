const express = require('express');
const router = express.Router();
const { login, create, read, update, remove } = require('../controllers/user_controller');

const {verifyToken, isAdmin, isOperator} = require('../middlewares/verifyAuth');

router.post('/login', login);
router.post('/user', verifyToken, isAdmin, create);
router.get('/users', verifyToken, isAdmin, read);
router.put('/user/:id', verifyToken, isAdmin, update);
router.delete('/user/:id', verifyToken, isAdmin, remove);

module.exports = router;