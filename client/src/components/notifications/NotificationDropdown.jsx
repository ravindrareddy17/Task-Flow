import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  HiOutlineBell,
  HiOutlineCheck,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineChatAlt2,
  HiOutlineUserAdd,
} from 'react-icons/hi';

const typeIcons = {
  task_assigned: HiOutlineClipboardList,
  deadline_reminder: HiOutlineClock,
  new_message: HiOutlineChatAlt2,
  project_invite: HiOutlineUserAdd,
  member_removed: HiOutlineUserAdd,
};

const typeColors = {
  task_assigned: 'var(--accent)',
  deadline_reminder: 'var(--priority-high)',
  new_message: 'var(--status-progress)',
  project_invite: 'var(--status-completed)',
  member_removed: 'var(--priority-medium)',
};

export default function NotificationDropdown({ notifications, unreadCount, onMarkRead, onMarkAllRead }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="btn btn-ghost btn-sm"
        onClick={() => setOpen(!open)}
        style={{ padding: 6, position: 'relative' }}
        title="Notifications"
      >
        <HiOutlineBell size={19} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: 'var(--priority-high)',
              color: '#fff',
              fontSize: '0.6rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 360,
              maxHeight: 420,
              background: 'var(--glass-bg-strong)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--glass-shadow-lg)',
              overflow: 'hidden',
              zIndex: 200,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <p
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Notifications
              </p>
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onMarkAllRead();
                  }}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--accent)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Mark all as read
                </motion.button>
              )}
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', maxHeight: 360 }}>
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: '40px 16px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                  }}
                >
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 20).map((notif) => {
                  const Icon = typeIcons[notif.type] || HiOutlineBell;
                  const color = typeColors[notif.type] || 'var(--text-muted)';

                  return (
                    <motion.div
                      key={notif.id}
                      whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                      onClick={() => {
                        if (!notif.read) onMarkRead(notif.id);
                      }}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                        cursor: notif.read ? 'default' : 'pointer',
                        borderBottom: '1px solid var(--border)',
                        background: notif.read ? 'transparent' : 'var(--accent-soft)',
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: `${color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={16} style={{ color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: notif.read ? 400 : 600,
                            color: 'var(--text-primary)',
                            marginBottom: 2,
                          }}
                        >
                          {notif.title}
                        </p>
                        <p
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {notif.message}
                        </p>
                        <p
                          style={{
                            fontSize: '0.65rem',
                            color: 'var(--text-muted)',
                            marginTop: 4,
                          }}
                        >
                          {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      {!notif.read && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'var(--accent)',
                            flexShrink: 0,
                            marginTop: 4,
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
