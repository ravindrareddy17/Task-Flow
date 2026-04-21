const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkProjectRole } = require('../middleware/rbac');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  inviteMember,
  removeMember,
  updateMemberRole,
  getProjectFiles,
} = require('../controllers/projectController');
const { getMessages } = require('../controllers/messageController');

router.use(auth);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', checkProjectRole('admin', 'editor', 'viewer'), getProjectById);
router.put('/:id', checkProjectRole('admin'), updateProject);
router.delete('/:id', checkProjectRole('admin'), deleteProject);

// Member management (admin only)
router.post('/:id/invite', checkProjectRole('admin'), inviteMember);
router.delete('/:id/members/:userId', checkProjectRole('admin'), removeMember);
router.put('/:id/members/:userId', checkProjectRole('admin'), updateMemberRole);

// Project messages
router.get('/:id/messages', checkProjectRole('admin', 'editor', 'viewer'), getMessages);

// Project files
router.get('/:id/files', checkProjectRole('admin', 'editor', 'viewer'), getProjectFiles);

module.exports = router;
