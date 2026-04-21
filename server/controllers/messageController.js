const { Message, User } = require('../models');

exports.getMessages = async (req, res) => {
  try {
    const { taskId, id: projectId } = req.params;
    const where = {};

    if (taskId) {
      where.taskId = taskId;
    } else if (projectId) {
      where.projectId = projectId;
      where.taskId = null; // project-level messages only
    }

    const messages = await Message.findAll({
      where,
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email', 'avatar'] }],
      order: [['createdAt', 'ASC']],
    });
    res.json(messages);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
