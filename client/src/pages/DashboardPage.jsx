import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
} from 'react-icons/hi';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import ChatPanel from '../components/chat/ChatPanel';

export default function DashboardPage({ tasks, loading, createTask, updateTask, deleteTask, activeFilter, taskCounts }) {
  const [modalTask, setModalTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [chatTask, setChatTask] = useState(null);

  // Listen for Navbar "New Task" button event
  useEffect(() => {
    const handler = () => {
      setModalTask(null);
      setShowModal(true);
    };
    window.addEventListener('openTaskModal', handler);
    return () => window.removeEventListener('openTaskModal', handler);
  }, []);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (activeFilter === 'all') return tasks;
    if (['pending', 'in-progress', 'completed'].includes(activeFilter)) {
      return tasks.filter((t) => t.status === activeFilter);
    }
    if (['high', 'medium', 'low'].includes(activeFilter)) {
      return tasks.filter((t) => t.priority === activeFilter);
    }
    return tasks;
  }, [tasks, activeFilter]);

  const handleCreateTask = () => {
    setModalTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setModalTask(task);
    setShowModal(true);
  };

  const handleSave = async (formData) => {
    if (modalTask?.id) {
      await updateTask(modalTask.id, formData);
    } else {
      await createTask(formData);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(id);
    }
  };

  // Stats for dashboard header
  const stats = [
    {
      label: 'Total Tasks',
      value: tasks.length,
      icon: HiOutlineClipboardList,
      color: 'var(--accent)',
    },
    {
      label: 'Pending',
      value: taskCounts.pending,
      icon: HiOutlineClock,
      color: 'var(--status-pending)',
    },
    {
      label: 'Completed',
      value: taskCounts.completed,
      icon: HiOutlineCheckCircle,
      color: 'var(--status-completed)',
    },
    {
      label: 'High Priority',
      value: taskCounts.high,
      icon: HiOutlineExclamation,
      color: 'var(--priority-high)',
    },
  ];

  return (
    <>
      <main
        style={{
          flex: 1,
          padding: '32px',
          minHeight: 'calc(100vh - 57px)',
          transition: 'margin-right 0.4s ease',
          marginRight: chatTask ? 380 : 0,
        }}
      >
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 32 }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.8rem',
              fontWeight: 700,
              marginBottom: 4,
              letterSpacing: '-0.02em',
            }}
          >
            Dashboard
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage your tasks and collaborate with your team
          </p>
        </motion.div>

        {/* Stat Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 36,
          }}
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${stat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 0 16px ${stat.color}15`,
                  }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-sans)',
                      color: 'var(--text-primary)',
                      lineHeight: 1,
                      marginBottom: 2,
                    }}
                  >
                    {stat.value}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tasks Grid */}
        <div style={{ marginBottom: 16 }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.15rem',
              fontWeight: 500,
              marginBottom: 16,
            }}
          >
            {activeFilter === 'all'
              ? 'All Tasks'
              : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Tasks`}
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 400,
                marginLeft: 8,
              }}
            >
              ({filteredTasks.length})
            </span>
          </h2>
        </div>

        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16,
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 200, borderRadius: 'var(--radius-lg)' }}
              />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              color: 'var(--text-muted)',
            }}
          >
            <HiOutlineClipboardList
              size={48}
              style={{ margin: '0 auto 16px', opacity: 0.3 }}
            />
            <p style={{ fontSize: '1rem', marginBottom: 4 }}>No tasks found</p>
            <p style={{ fontSize: '0.82rem' }}>
              Create a new task to get started
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16,
            }}
          >
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDelete}
                  onOpenChat={setChatTask}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          task={modalTask}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {chatTask && (
          <ChatPanel task={chatTask} onClose={() => setChatTask(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
