const express = require('express');
const router = express.Router();
const { login, create, read, update, remove } = require('../controllers/user_controller');

router.post('/login', login);
router.post('/user', create);
router.get('/user', read);
router.put('/user/:id', update);
router.delete('/user/:id', remove);

module.exports = router;