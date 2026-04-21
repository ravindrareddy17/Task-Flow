const { Project, ProjectMember, User, Task, Subtask, Message, File, TaskAssignment } = require('../models');
const { Op } = require('sequelize');

// Create a new project — creator becomes admin
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });

    const project = await Project.create({
      name,
      description: description || '',
      createdBy: req.user.id,
    });

    // Auto-add creator as admin member
    await ProjectMember.create({
      userId: req.user.id,
      projectId: project.id,
      role: 'admin',
    });

    const fullProject = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar'] },
        {
          model: ProjectMember,
          as: 'memberships',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }],
        },
      ],
    });

    res.status(201).json(fullProject);
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all projects user is a member of
exports.getProjects = async (req, res) => {
  try {
    const memberships = await ProjectMember.findAll({
      where: { userId: req.user.id },
      attributes: ['projectId', 'role'],
    });

    const projectIds = memberships.map((m) => m.projectId);
    if (projectIds.length === 0) return res.json([]);

    const projects = await Project.findAll({
      where: { id: { [Op.in]: projectIds } },
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar'] },
        {
          model: ProjectMember,
          as: 'memberships',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }],
        },
      ],
      order: [['updatedAt', 'DESC']],
    });

    // Attach user's role to each project
    const result = projects.map((p) => {
      const membership = memberships.find((m) => m.projectId === p.id);
      return { ...p.toJSON(), myRole: membership?.role };
    });

    res.json(result);
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single project by ID
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar'] },
        {
          model: ProjectMember,
          as: 'memberships',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }],
        },
        {
          model: Task,
          as: 'tasks',
          include: [
            { model: Subtask, as: 'subtasks' },
            { model: User, as: 'assignees', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: [] } },
            { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
          ],
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Get user's role
    const membership = await ProjectMember.findOne({
      where: { userId: req.user.id, projectId: id },
    });

    res.json({ ...project.toJSON(), myRole: membership?.role });
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update project (admin only — enforced via RBAC middleware)
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    await project.update({ name, description });
    res.json(project);
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete project (admin only)
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Cascade: remove members, tasks, subtasks, messages
    await ProjectMember.destroy({ where: { projectId: id } });
    const tasks = await Task.findAll({ where: { projectId: id }, attributes: ['id'] });
    const taskIds = tasks.map((t) => t.id);
    if (taskIds.length > 0) {
      await TaskAssignment.destroy({ where: { taskId: { [Op.in]: taskIds } } });
      await Subtask.destroy({ where: { taskId: { [Op.in]: taskIds } } });
      await Message.destroy({ where: { taskId: { [Op.in]: taskIds } } });
      await Task.destroy({ where: { projectId: id } });
    }
    await File.destroy({ where: { projectId: id } });
    await Message.destroy({ where: { projectId: id } });
    await project.destroy();

    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Invite member to project (admin only)
exports.inviteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required' });
    if (!['admin', 'editor', 'viewer'].includes(role || 'viewer')) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found with that email' });

    // Check if already a member
    const existing = await ProjectMember.findOne({
      where: { userId: user.id, projectId: id },
    });
    if (existing) return res.status(409).json({ error: 'User is already a project member' });

    await ProjectMember.create({
      userId: user.id,
      projectId: id,
      role: role || 'viewer',
    });

    const membership = await ProjectMember.findOne({
      where: { userId: user.id, projectId: id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }],
    });

    res.status(201).json(membership);
  } catch (err) {
    console.error('Invite member error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove member from project (admin only)
exports.removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Prevent self-removal if admin
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot remove yourself from the project' });
    }

    const result = await ProjectMember.destroy({
      where: { userId, projectId: id },
    });

    if (!result) return res.status(404).json({ error: 'Member not found' });
    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update member role (admin only)
exports.updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const membership = await ProjectMember.findOne({
      where: { userId, projectId: id },
    });
    if (!membership) return res.status(404).json({ error: 'Member not found' });

    await membership.update({ role });

    const updated = await ProjectMember.findOne({
      where: { userId, projectId: id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }],
    });

    res.json(updated);
  } catch (err) {
    console.error('Update member role error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get project files
exports.getProjectFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const files = await File.findAll({
      where: { projectId: id },
      include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'avatar'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(files);
  } catch (err) {
    console.error('Get files error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
