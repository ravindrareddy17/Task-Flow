const sequelize = require('../config/db');
const User = require('./User');
const Task = require('./Task');
const Subtask = require('./Subtask');
const TaskAssignment = require('./TaskAssignment');
const Message = require('./Message');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const PersonalTask = require('./PersonalTask');
const File = require('./File');
const Notification = require('./Notification');

// ── Existing Associations (preserved) ──

// User → Tasks (creator)
User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Task → Subtasks
Task.hasMany(Subtask, { foreignKey: 'taskId', as: 'subtasks', onDelete: 'CASCADE' });
Subtask.belongsTo(Task, { foreignKey: 'taskId' });

// Many-to-Many: Users ↔ Tasks (assignments)
User.belongsToMany(Task, { through: TaskAssignment, foreignKey: 'userId', as: 'assignedTasks' });
Task.belongsToMany(User, { through: TaskAssignment, foreignKey: 'taskId', as: 'assignees' });

// Task → Messages
Task.hasMany(Message, { foreignKey: 'taskId', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(Task, { foreignKey: 'taskId' });

// User → Messages
User.hasMany(Message, { foreignKey: 'userId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'sender' });

// ── New Associations ──

// User → Projects (creator)
User.hasMany(Project, { foreignKey: 'createdBy', as: 'ownedProjects' });
Project.belongsTo(User, { foreignKey: 'createdBy', as: 'owner' });

// Project ↔ User (membership via ProjectMember)
Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'projectId', otherKey: 'userId', as: 'members' });
User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'userId', otherKey: 'projectId', as: 'projects' });

// ProjectMember direct associations
Project.hasMany(ProjectMember, { foreignKey: 'projectId', as: 'memberships', onDelete: 'CASCADE' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId' });
User.hasMany(ProjectMember, { foreignKey: 'userId', as: 'projectMemberships' });
ProjectMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Project → Tasks
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Project → Messages (project-level chat)
Project.hasMany(Message, { foreignKey: 'projectId', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// User → PersonalTasks
User.hasMany(PersonalTask, { foreignKey: 'userId', as: 'personalTasks', onDelete: 'CASCADE' });
PersonalTask.belongsTo(User, { foreignKey: 'userId' });

// User → Notifications
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// File associations
User.hasMany(File, { foreignKey: 'uploadedBy', as: 'uploadedFiles' });
File.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
Task.hasMany(File, { foreignKey: 'taskId', as: 'files' });
File.belongsTo(Task, { foreignKey: 'taskId' });
Message.hasMany(File, { foreignKey: 'messageId', as: 'files' });
File.belongsTo(Message, { foreignKey: 'messageId' });
Project.hasMany(File, { foreignKey: 'projectId', as: 'files', onDelete: 'CASCADE' });
File.belongsTo(Project, { foreignKey: 'projectId' });

module.exports = {
  sequelize,
  User,
  Task,
  Subtask,
  TaskAssignment,
  Message,
  Project,
  ProjectMember,
  PersonalTask,
  File,
  Notification,
};
