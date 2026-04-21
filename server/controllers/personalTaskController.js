const { PersonalTask } = require('../models');

exports.getPersonalTasks = async (req, res) => {
  try {
    const tasks = await PersonalTask.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(tasks);
  } catch (err) {
    console.error('Get personal tasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createPersonalTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const task = await PersonalTask.create({
      title,
      description: description || '',
      dueDate: dueDate || null,
      priority: priority || 'medium',
      status: status || 'pending',
      userId: req.user.id,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error('Create personal task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updatePersonalTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await PersonalTask.findOne({ where: { id, userId: req.user.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { title, description, dueDate, priority, status } = req.body;
    await task.update({ title, description, dueDate, priority, status });
    res.json(task);
  } catch (err) {
    console.error('Update personal task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deletePersonalTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await PersonalTask.findOne({ where: { id, userId: req.user.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await task.destroy();
    res.json({ message: 'Personal task deleted' });
  } catch (err) {
    console.error('Delete personal task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
