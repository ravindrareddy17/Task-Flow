const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMessages } = require('../controllers/messageController');

router.use(auth);
router.get('/tasks/:taskId/messages', getMessages);

module.exports = router;
