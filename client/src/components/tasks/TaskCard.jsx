import { motion } from 'framer-motion';
import { formatDistanceToNow, isPast } from 'date-fns';
import {
  HiOutlineChatAlt2,
  HiOutlineCalendar,
  HiOutlineTrash,
} from 'react-icons/hi';

export default function TaskCard({ task, onEdit, onDelete, onOpenChat }) {
  const priorityClass = `badge-${task.priority}`;
  const statusClass = `badge-${task.status}`;

  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="card"
      style={{ padding: '20px', cursor: 'pointer' }}
      onClick={() => onEdit(task)}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className={`badge ${priorityClass}`}>{task.priority}</span>
          <span className={`badge ${statusClass}`}>{task.status}</span>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            className="btn btn-ghost btn-sm"
            onClick={(e) => { e.stopPropagation(); onOpenChat(task); }}
            style={{ padding: 6 }}
            title="Chat"
          >
            <HiOutlineChatAlt2 size={15} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            className="btn btn-ghost btn-sm"
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            style={{ padding: 6, color: 'var(--priority-high)' }}
            title="Delete"
          >
            <HiOutlineTrash size={15} />
          </motion.button>
        </div>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: '1.05rem',
          fontWeight: 600,
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-primary)',
          marginBottom: 6,
          lineHeight: 1.3,
        }}
      >
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: 12,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {task.description}
        </p>
      )}

      {/* Subtask Progress */}
      {totalSubtasks > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Subtasks
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
          <div
            style={{
              height: 3,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'var(--accent-gradient)',
                borderRadius: 2,
                boxShadow: '0 0 8px var(--accent-glow)',
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 12,
          borderTop: '1px solid var(--glass-border)',
        }}
      >
        {/* Assignees */}
        <div style={{ display: 'flex' }}>
          {task.assignees?.slice(0, 4).map((user, i) => (
            <div
              key={user.id}
              className="avatar avatar-sm"
              style={{
                marginLeft: i > 0 ? -6 : 0,
                border: '2px solid var(--bg-primary)',
                zIndex: 4 - i,
              }}
              title={user.name}
            >
              {user.name?.[0]?.toUpperCase()}
            </div>
          ))}
          {task.assignees?.length > 4 && (
            <div
              className="avatar avatar-sm"
              style={{
                marginLeft: -6,
                background: 'var(--glass-bg-strong)',
                color: 'var(--text-muted)',
                fontSize: '0.6rem',
                boxShadow: 'none',
              }}
            >
              +{task.assignees.length - 4}
            </div>
          )}
        </div>

        {/* Deadline */}
        {task.deadline && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              background: isPast(new Date(task.deadline)) && task.status !== 'completed' ? 'rgba(248, 113, 113, 0.15)' : 'var(--glass-bg)',
              color: isPast(new Date(task.deadline)) && task.status !== 'completed' ? '#f87171' : 'var(--text-muted)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <HiOutlineCalendar size={13} />
            {isPast(new Date(task.deadline)) && task.status !== 'completed' ? 'Overdue by ' : 'Due in '}
            {formatDistanceToNow(new Date(task.deadline))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
