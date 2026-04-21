import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineX,
} from 'react-icons/hi';
import { usePersonalTasks } from '../hooks/usePersonalTasks';

export default function PersonalTasksPage() {
  const { personalTasks, loading, createPersonalTask, updatePersonalTask, deletePersonalTask } = usePersonalTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium', status: 'pending' });

  const resetForm = () => {
    setForm({ title: '', description: '', dueDate: '', priority: 'medium', status: 'pending' });
    setEditingTask(null);
    setShowForm(false);
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
      priority: task.priority,
      status: task.status,
    });
    setEditingTask(task);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingTask) {
      await updatePersonalTask(editingTask.id, form);
    } else {
      await createPersonalTask(form);
    }
    resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      await deletePersonalTask(id);
    }
  };

  const stats = useMemo(() => ({
    total: personalTasks.length,
    pending: personalTasks.filter((t) => t.status === 'pending').length,
    completed: personalTasks.filter((t) => t.status === 'completed').length,
  }), [personalTasks]);

  return (
    <div style={{ padding: '32px', maxWidth: 800 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 32 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.8rem',
              fontWeight: 500,
            }}
          >
            Personal Tasks
          </h1>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="btn btn-primary btn-sm"
            onClick={() => { resetForm(); setShowForm(true); }}
            style={{ gap: 6 }}
          >
            <HiOutlinePlus size={15} />
            New Task
          </motion.button>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {stats.total} tasks · {stats.pending} pending · {stats.completed} completed
        </p>
      </motion.div>

      {/* Inline Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSave}
            className="card"
            style={{ padding: 20, marginBottom: 24, overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                {editingTask ? 'Edit Task' : 'New Task'}
              </h3>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="btn btn-ghost btn-sm"
                onClick={resetForm}
                style={{ padding: 4 }}
              >
                <HiOutlineX size={16} />
              </motion.button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Task title..."
                required
                autoFocus
              />
              <textarea
                className="input"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description (optional)..."
                rows={2}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <input
                  className="input"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                />
                <select
                  className="input"
                  value={form.priority}
                  onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <select
                  className="input"
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <motion.button type="button" whileTap={{ scale: 0.98 }} className="btn btn-secondary btn-sm" onClick={resetForm}>
                  Cancel
                </motion.button>
                <motion.button type="submit" whileTap={{ scale: 0.98 }} className="btn btn-primary btn-sm">
                  {editingTask ? 'Update' : 'Create'}
                </motion.button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : personalTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}
        >
          <HiOutlineClipboardList size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontSize: '1rem', marginBottom: 4 }}>No personal tasks</p>
          <p style={{ fontSize: '0.82rem' }}>These tasks are private to you</p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnimatePresence>
            {personalTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ y: -2 }}
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'pointer',
                }}
                onClick={() => handleEdit(task)}
              >
                {/* Status indicator */}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background:
                      task.status === 'completed'
                        ? 'var(--status-completed)'
                        : task.status === 'in-progress'
                        ? 'var(--status-progress)'
                        : 'var(--status-pending)',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                      color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)',
                      marginBottom: 2,
                    }}
                  >
                    {task.title}
                  </p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge badge-${task.priority}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <HiOutlineCalendar size={12} />
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                  style={{ padding: 6, color: 'var(--priority-high)' }}
                >
                  <HiOutlineTrash size={15} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
