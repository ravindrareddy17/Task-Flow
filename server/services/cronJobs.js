const cron = require('node-cron');
const { Op } = require('sequelize');
const { Task, TaskAssignment } = require('../models');
const { createNotification } = require('./notificationService');

// Track tasks that have already been notified (prevents spam every 60s)
const notifiedTasks = new Set();

/**
 * Initialize cron jobs.
 * @param {Object} io - Socket.IO server instance
 */
function initCronJobs(io) {
  // Run every minute to check for exact deadlines
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Find tasks that are due in exactly 1 hour or less from now, but haven't passed
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      const urgentTasks = await Task.findAll({
        where: {
          deadline: {
            [Op.lt]: oneHourFromNow,
            [Op.gt]: now,
          },
          status: { [Op.ne]: 'completed' },
        },
      });

      for (const task of urgentTasks) {
        // Skip if we already notified for this task's deadline
        if (notifiedTasks.has(task.id)) continue;
        notifiedTasks.add(task.id);
        // Auto-clear after 2 hours so tasks can be re-notified for future deadlines
        setTimeout(() => notifiedTasks.delete(task.id), 2 * 60 * 60 * 1000);

        const msg = `⚠️ Reminder: "${task.title}" is due in less than an hour at ${new Date(task.deadline).toLocaleTimeString()}!`;
        
        // Notify the creator
        await createNotification(
          io,
          task.createdBy,
          'deadline_reminder',
          'Deadline Approaching',
          msg,
          { taskId: task.id }
        );

        // Notify assignees
        const assignments = await TaskAssignment.findAll({
          where: { taskId: task.id },
        });
        
        for (const assignment of assignments) {
          if (assignment.userId !== task.createdBy) {
            await createNotification(
              io,
              assignment.userId,
              'deadline_reminder',
              'Deadline Approaching',
              msg,
              { taskId: task.id }
            );
          }
        }
      }
    } catch (err) {
      console.error('[CRON] Deadline check error:', err);
    }
  });

  console.log('[CRON] 1-minute Deadline reminder job scheduled');
}

module.exports = { initCronJobs };
