import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineLogout, HiOutlineViewGrid, HiOutlinePlus, HiOutlineArrowLeft } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationDropdown from '../notifications/NotificationDropdown';

export default function Navbar({ onCreateTask }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const showBack = location.pathname !== '/';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderRadius: 0,
      }}
    >
      {/* Left: Logo + Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {showBack && (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(-1)}
            title="Go Back"
            style={{ padding: 6 }}
          >
            <HiOutlineArrowLeft size={18} />
          </motion.button>
        )}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#0b1120',
              boxShadow: '0 0 18px var(--accent-glow)',
            }}
          >
            TF
          </div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            TaskFlow
          </span>
        </Link>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {onCreateTask && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="btn btn-primary btn-sm"
            onClick={onCreateTask}
            style={{ gap: 6 }}
          >
            <HiOutlinePlus size={15} />
            New Task
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/')}
          title="Dashboard"
        >
          <HiOutlineViewGrid size={17} />
        </motion.button>

        {/* Notification Bell */}
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
        />

        {/* Theme Toggle */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <div className="toggle-thumb" />
        </button>

        {/* Avatar & User */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginLeft: 8,
            paddingLeft: 14,
            borderLeft: '1px solid var(--glass-border)',
          }}
        >
          <div className="avatar">{initials}</div>
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}
          >
            {user?.name}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            title="Logout"
            style={{ padding: '6px' }}
          >
            <HiOutlineLogout size={17} />
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
