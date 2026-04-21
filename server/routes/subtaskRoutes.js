const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createSubtask, updateSubtask, deleteSubtask } = require('../controllers/subtaskController');

router.use(auth);

router.post('/tasks/:taskId/subtasks', createSubtask);
router.put('/subtasks/:id', updateSubtask);
router.delete('/subtasks/:id', deleteSubtask);

module.exports = router;
