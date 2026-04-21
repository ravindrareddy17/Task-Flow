const { Notification } = require('../models');

// In-memory map of userId → Set<socketId> for real-time delivery
let userSocketMap = {};

function setUserSocketMap(map) {
  userSocketMap = map;
}

function getUserSocketMap() {
  return userSocketMap;
}

/**
 * Create a notification and optionally push it via socket.
 */
async function createNotification(io, userId, type, title, message, metadata = null) {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      read: false,
      metadata,
    });

    // Push via socket if user is online
    if (io && userSocketMap[userId]) {
      userSocketMap[userId].forEach((socketId) => {
        io.to(socketId).emit('notification', notification.toJSON());
      });
    }

    return notification;
  } catch (err) {
    console.error('Create notification error:', err);
    return null;
  }
}

module.exports = {
  createNotification,
  setUserSocketMap,
  getUserSocketMap,
};
