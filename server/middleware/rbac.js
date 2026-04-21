const { ProjectMember } = require('../models');

/**
 * RBAC middleware factory.
 * Checks if the authenticated user has one of the allowed roles
 * for the project specified by :id or :projectId in params, or projectId in body.
 *
 * Usage: checkProjectRole('admin') or checkProjectRole('admin', 'editor')
 */
function checkProjectRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.params.projectId || req.body.projectId;
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      const membership = await ProjectMember.findOne({
        where: { userId: req.user.id, projectId },
      });

      if (!membership) {
        return res.status(403).json({ error: 'You are not a member of this project' });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({ error: `Requires one of: ${allowedRoles.join(', ')}` });
      }

      req.projectRole = membership.role;
      next();
    } catch (err) {
      console.error('RBAC error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };
}

module.exports = { checkProjectRole };
