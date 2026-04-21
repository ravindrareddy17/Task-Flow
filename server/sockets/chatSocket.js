const jwt = require('jsonwebtoken');
const { Message, User } = require('../models');
const { setUserSocketMap, getUserSocketMap } = require('../services/notificationService');

module.exports = function setupChatSocket(io) {
  const userSocketMap = {};

  // ── JWT Auth Middleware ──
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error: no token'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error: invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user ${socket.userId})`);

    // Auto-register from JWT
    if (socket.userId) {
      if (!userSocketMap[socket.userId]) userSocketMap[socket.userId] = new Set();
      userSocketMap[socket.userId].add(socket.id);
      setUserSocketMap(userSocketMap);
    }

    // Legacy manual register (backward compat)
    socket.on('registerUser', (userId) => {
      if (!userId) return;
      if (!userSocketMap[userId]) userSocketMap[userId] = new Set();
      userSocketMap[userId].add(socket.id);
      socket.userId = userId;
      setUserSocketMap(userSocketMap);
    });

    // ── Task Room ──
    socket.on('joinRoom', (taskId) => {
      socket.join(`task-${taskId}`);
    });

    socket.on('leaveRoom', (taskId) => {
      socket.leave(`task-${taskId}`);
    });

    // ── Project Room ──
    socket.on('joinProjectRoom', (projectId) => {
      socket.join(`project-${projectId}`);
    });

    socket.on('leaveProjectRoom', (projectId) => {
      socket.leave(`project-${projectId}`);
    });

    // ── Task Message ──
    socket.on('sendMessage', async (data) => {
      try {
        const { taskId, content, fileUrl } = data;
        const userId = socket.userId || data.userId;

        const message = await Message.create({
          content: content || '',
          fileUrl: fileUrl || null,
          taskId,
          userId,
        });

        const fullMessage = await Message.findByPk(message.id, {
          include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email', 'avatar'] }],
        });

        io.to(`task-${taskId}`).emit('newMessage', fullMessage);
      } catch (err) {
        console.error('Socket sendMessage error:', err);
      }
    });

    // ── Project Message ──
    socket.on('sendProjectMessage', async (data) => {
      try {
        const { projectId, content, fileUrl } = data;
        const userId = socket.userId || data.userId;

        const message = await Message.create({
          content: content || '',
          fileUrl: fileUrl || null,
          projectId,
          taskId: null,
          userId,
        });

        const fullMessage = await Message.findByPk(message.id, {
          include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email', 'avatar'] }],
        });

        io.to(`project-${projectId}`).emit('newProjectMessage', fullMessage);
      } catch (err) {
        console.error('Socket sendProjectMessage error:', err);
      }
    });

    // ── Typing Indicators ──
    socket.on('typing', ({ taskId, userName }) => {
      socket.to(`task-${taskId}`).emit('userTyping', { userName });
    });

    socket.on('stopTyping', ({ taskId, userName }) => {
      socket.to(`task-${taskId}`).emit('userStopTyping', { userName });
    });

    socket.on('projectTyping', ({ projectId, userName }) => {
      socket.to(`project-${projectId}`).emit('userTyping', { userName });
    });

    socket.on('projectStopTyping', ({ projectId, userName }) => {
      socket.to(`project-${projectId}`).emit('userStopTyping', { userName });
    });

    // ── Disconnect ──
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.userId && userSocketMap[socket.userId]) {
        userSocketMap[socket.userId].delete(socket.id);
        if (userSocketMap[socket.userId].size === 0) {
          delete userSocketMap[socket.userId];
        }
        setUserSocketMap(userSocketMap);
      }
    });
  });
};
