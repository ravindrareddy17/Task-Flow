const { Task, Subtask, User, TaskAssignment, ProjectMember } = require('../models');
const { createNotification } = require('../services/notificationService');

exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    const where = {};

    if (projectId) {
      // Verify membership
      const membership = await ProjectMember.findOne({
        where: { userId: req.user.id, projectId },
      });
      if (!membership) {
        return res.status(403).json({ error: 'Not a member of this project' });
      }
      where.projectId = projectId;
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: Subtask, as: 'subtasks' },
        { model: User, as: 'assignees', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: [] } },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(tasks);
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, deadline, priority, status, assignees, subtasks, projectId } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // If projectId provided, verify membership
    if (projectId) {
      const membership = await ProjectMember.findOne({
        where: { userId: req.user.id, projectId },
      });
      if (!membership || !['admin', 'editor'].includes(membership.role)) {
        return res.status(403).json({ error: 'You do not have permission to create tasks in this project' });
      }
    }

    const task = await Task.create({
      title,
      description: description || '',
      deadline: deadline || null,
      priority: priority || 'medium',
      status: status || 'pending',
      createdBy: req.user.id,
      projectId: projectId || null,
    });

    // Assign users
    if (assignees && assignees.length > 0) {
      const assignments = assignees.map((userId) => ({ taskId: task.id, userId }));
      await TaskAssignment.bulkCreate(assignments);
    }

    // Create subtasks
    if (subtasks && subtasks.length > 0) {
      const subs = subtasks.map((s) => ({ title: s.title || s, completed: false, taskId: task.id }));
      await Subtask.bulkCreate(subs);
    }

    // Fetch the complete task
    const fullTask = await Task.findByPk(task.id, {
      include: [
        { model: Subtask, as: 'subtasks' },
        { model: User, as: 'assignees', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: [] } },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
      ],
    });

    res.status(201).json(fullTask);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, priority, status, assignees } = req.body;

    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await task.update({ title, description, deadline, priority, status });

    // Update assignees if provided
    if (assignees) {
      await TaskAssignment.destroy({ where: { taskId: id } });
      if (assignees.length > 0) {
        const assignments = assignees.map((userId) => ({ taskId: id, userId }));
        await TaskAssignment.bulkCreate(assignments);
      }
    }

    const fullTask = await Task.findByPk(id, {
      include: [
        { model: Subtask, as: 'subtasks' },
        { model: User, as: 'assignees', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: [] } },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
      ],
    });

    res.json(fullTask);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await TaskAssignment.destroy({ where: { taskId: id } });
    await Subtask.destroy({ where: { taskId: id } });
    await task.destroy();

    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /tasks/:id/assign — assign multiple users to a task
exports.assignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;

    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    // Replace all assignments
    await TaskAssignment.destroy({ where: { taskId: id } });
    if (userIds.length > 0) {
      const assignments = userIds.map((userId) => ({ taskId: id, userId }));
      await TaskAssignment.bulkCreate(assignments);

      // Send notification to each assignee
      for (const userId of userIds) {
        if (userId !== req.user.id) {
          await createNotification(
            req.app.get('io'),
            userId,
            'task_assigned',
            'Task Assigned',
            `You were assigned to "${task.title}"`,
            { taskId: task.id, projectId: task.projectId }
          );
        }
      }
    }

    const fullTask = await Task.findByPk(id, {
      include: [
        { model: Subtask, as: 'subtasks' },
        { model: User, as: 'assignees', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: [] } },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
      ],
    });

    res.json(fullTask);
  } catch (err) {
    console.error('Assign task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
