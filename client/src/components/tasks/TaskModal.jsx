import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import api from '../../services/api';

export default function TaskModal({ task, onClose, onSave, projectId }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    status: 'pending',
    assignees: [],
    subtasks: [],
  });
  const [users, setUsers] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [saving, setSaving] = useState(false);

  const isEdit = !!task?.id;

  useEffect(() => {
    api.get('/users').then(({ data }) => setUsers(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (task) {
      let deadlineStr = '';
      if (task.deadline) {
        try {
          deadlineStr = new Date(task.deadline).toISOString().slice(0, 16);
        } catch { deadlineStr = ''; }
      }
      setForm({
        title: task.title || '',
        description: task.description || '',
        deadline: deadlineStr,
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        assignees: task.assignees?.map((u) => u.id) || [],
        subtasks: task.subtasks || [],
      });
    }
  }, [task]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAssignee = (userId) => {
    setForm((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter((id) => id !== userId)
        : [...prev.assignees, userId],
    }));
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setForm((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, { title: newSubtask.trim(), completed: false }],
    }));
    setNewSubtask('');
  };

  const removeSubtask = (index) => {
    setForm((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const toggleSubtask = (index) => {
    setForm((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((s, i) =>
        i === index ? { ...s, completed: !s.completed } : s
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (projectId && !isEdit) {
        payload.projectId = projectId;
      }
      await onSave(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h2
              style={{
                fontSize: '1.15rem',
                fontWeight: 600,
                fontFamily: 'var(--font-heading)',
              }}
            >
              {isEdit ? 'Edit Task' : 'Create Task'}
              {projectId && !isEdit && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 400, marginLeft: 8 }}>
                  (Project Task)
                </span>
              )}
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              style={{ padding: 6 }}
            >
              <HiOutlineX size={18} />
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Title */}
              <div>
                <label className="label">Title</label>
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter task title..."
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                />
              </div>

              {/* Row: Due Date, Priority, Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Deadline</label>
                  <input
                    className="input"
                    type="datetime-local"
                    value={form.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select
                    className="input"
                    value={form.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input"
                    value={form.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Assignees */}
              <div>
                <label className="label">Assign Members</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {users.map((u) => {
                    const selected = form.assignees.includes(u.id);
                    return (
                      <motion.button
                        key={u.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggleAssignee(u.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          borderRadius: 100,
                          border: `1px solid ${selected ? 'var(--accent)' : 'var(--glass-border)'}`,
                          background: selected ? 'var(--accent-soft)' : 'transparent',
                          color: selected ? 'var(--accent)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 500,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div
                          className="avatar avatar-sm"
                          style={{ width: 18, height: 18, fontSize: '0.55rem' }}
                        >
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        {u.name}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <label className="label">Subtasks</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    className="input"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add a subtask..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-secondary btn-sm"
                    onClick={addSubtask}
                    style={{ flexShrink: 0, padding: '10px' }}
                  >
                    <HiOutlinePlus size={16} />
                  </motion.button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {form.subtasks.map((sub, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-elevated)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        onChange={() => toggleSubtask(i)}
                        style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontSize: '0.85rem',
                          textDecoration: sub.completed ? 'line-through' : 'none',
                          color: sub.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                        }}
                      >
                        {sub.title}
                      </span>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => removeSubtask(i)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          padding: 2,
                        }}
                      >
                        <HiOutlineTrash size={13} />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                marginTop: 24,
                paddingTop: 16,
                borderTop: '1px solid var(--border)',
              }}
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
