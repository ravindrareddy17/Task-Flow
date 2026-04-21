const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadMiddleware, uploadFile } = require('../controllers/uploadController');

router.use(auth);
router.post('/', uploadMiddleware, uploadFile);

module.exports = router;
