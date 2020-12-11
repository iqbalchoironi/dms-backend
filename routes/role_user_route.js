const express = require('express');
const router = express.Router();
const { create, read, update, remove } = require('../controllers/role_user_controller');

const {verifyToken, isAdmin, isOperator} = require('../middlewares/verifyAuth');

router.get('/roles', verifyToken, isAdmin, read);
router.post('/role', verifyToken, isAdmin, create);
router.put('/role/:id', verifyToken, isAdmin, update);
router.delete('/role/:id', verifyToken, isAdmin, remove);

module.exports = router;