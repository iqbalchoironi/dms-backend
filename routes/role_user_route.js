const express = require('express');
const router = express.Router();
const { login, create, read, update, remove } = require('../controllers/role_user_controller');

router.get('/roles', read);
router.post('/role', create);
router.put('/role/:id', update);
router.delete('/role/:id', remove);

module.exports = router;