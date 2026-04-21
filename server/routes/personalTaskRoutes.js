const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getPersonalTasks,
  createPersonalTask,
  updatePersonalTask,
  deletePersonalTask,
} = require('../controllers/personalTaskController');

router.use(auth);

router.get('/', getPersonalTasks);
router.post('/', createPersonalTask);
router.put('/:id', updatePersonalTask);
router.delete('/:id', deletePersonalTask);

module.exports = router;
