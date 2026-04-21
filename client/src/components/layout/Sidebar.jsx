import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineLightningBolt,
  HiOutlineCollection,
  HiOutlinePlus,
  HiOutlineFolder,
  HiOutlineUser,
} from 'react-icons/hi';
import { useProjects } from '../../hooks/useProjects';

const filters = [
  { key: 'all', label: 'All Tasks', icon: HiOutlineCollection },
  { key: 'pending', label: 'Pending', icon: HiOutlineClock },
  { key: 'in-progress', label: 'In Progress', icon: HiOutlineLightningBolt },
  { key: 'completed', label: 'Completed', icon: HiOutlineCheckCircle },
  { divider: true },
  { key: 'high', label: 'High Priority', icon: HiOutlineExclamation },
  { key: 'medium', label: 'Medium Priority', icon: HiOutlineClipboardList },
  { key: 'low', label: 'Low Priority', icon: HiOutlineCheckCircle },
];

export default function Sidebar({ activeFilter, onFilterChange, taskCounts, onCreateProject, onViewPersonalTasks, activeSection }) {
  const { projects } = useProjects();
  const navigate = useNavigate();
  const location = useLocation();

  const isProjectPage = location.pathname.startsWith('/projects/');
  const isPersonalPage = location.pathname === '/personal';

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: 250,
        padding: '20px 12px',
        borderRight: '1px solid var(--glass-border)',
        height: 'calc(100vh - 55px)',
        position: 'sticky',
        top: 55,
        flexShrink: 0,
        overflowY: 'auto',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Projects Section */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 12px',
            marginBottom: 10,
          }}
        >
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Projects
          </p>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={onCreateProject}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--accent)',
              padding: 2,
              display: 'flex',
              alignItems: 'center',
            }}
            title="New Project"
          >
            <HiOutlinePlus size={14} />
          </motion.button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {projects.map((project) => {
            const active = location.pathname === `/projects/${project.id}`;
            return (
              <motion.button
                key={project.id}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/projects/${project.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: active ? 'var(--accent-soft)' : 'transparent',
                  border: active ? '1px solid rgba(74, 222, 128, 0.15)' : '1px solid transparent',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: active ? 500 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%',
                  textAlign: 'left',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <HiOutlineFolder size={16} style={{ flexShrink: 0 }} />
                <span
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {project.name}
                </span>
              </motion.button>
            );
          })}
          {projects.length === 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '4px 12px' }}>
              No projects yet
            </p>
          )}
        </div>
      </div>

      {/* Personal Tasks */}
      <div style={{ marginBottom: 20 }}>
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (onViewPersonalTasks) onViewPersonalTasks();
            navigate('/personal');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: isPersonalPage ? 'var(--accent-soft)' : 'transparent',
            border: isPersonalPage ? '1px solid rgba(74, 222, 128, 0.15)' : '1px solid transparent',
            color: isPersonalPage ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: '0.85rem',
            fontWeight: isPersonalPage ? 500 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            width: '100%',
            textAlign: 'left',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <HiOutlineUser size={16} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>Personal Tasks</span>
        </motion.button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--glass-border)', margin: '0 12px 14px' }} />

      {/* Filters (only show on dashboard) */}
      {!isProjectPage && !isPersonalPage && (
        <>
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '0 12px',
              marginBottom: 8,
            }}
          >
            Filters
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filters.map((item, i) => {
              if (item.divider) {
                return (
                  <div
                    key={`d-${i}`}
                    style={{
                      height: 1,
                      background: 'var(--glass-border)',
                      margin: '8px 12px',
                    }}
                  />
                );
              }

              const Icon = item.icon;
              const active = activeFilter === item.key;
              const count = taskCounts?.[item.key] ?? 0;

              return (
                <motion.button
                  key={item.key}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onFilterChange(item.key);
                    navigate('/');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: active ? 'var(--accent-soft)' : 'transparent',
                    border: active ? '1px solid rgba(74, 222, 128, 0.15)' : '1px solid transparent',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    fontWeight: active ? 500 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: '100%',
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {count > 0 && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: active ? 'var(--accent)' : 'var(--text-muted)',
                        fontWeight: 600,
                        minWidth: 20,
                        textAlign: 'right',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </>
      )}
    </motion.aside>
  );
}
