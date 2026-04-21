const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUsers, getMe } = require('../controllers/userController');

router.use(auth);

router.get('/', getUsers);
router.get('/me', getMe);

module.exports = router;
