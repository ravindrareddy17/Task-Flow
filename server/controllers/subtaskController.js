const { Subtask } = require('../models');

exports.createSubtask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const subtask = await Subtask.create({ title, completed: false, taskId });
    res.status(201).json(subtask);
  } catch (err) {
    console.error('Create subtask error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateSubtask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const subtask = await Subtask.findByPk(id);
    if (!subtask) return res.status(404).json({ error: 'Subtask not found' });

    await subtask.update({ title, completed });
    res.json(subtask);
  } catch (err) {
    console.error('Update subtask error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteSubtask = async (req, res) => {
  try {
    const { id } = req.params;
    const subtask = await Subtask.findByPk(id);
    if (!subtask) return res.status(404).json({ error: 'Subtask not found' });

    await subtask.destroy();
    res.json({ message: 'Subtask deleted' });
  } catch (err) {
    console.error('Delete subtask error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
