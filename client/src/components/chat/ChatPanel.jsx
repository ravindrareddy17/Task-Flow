import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  HiOutlineX,
  HiOutlinePaperAirplane,
  HiOutlinePhotograph,
  HiOutlinePaperClip,
} from 'react-icons/hi';
import { useSocket, useProjectSocket } from '../../hooks/useSocket';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ChatPanel({ task, projectId, onClose }) {
  const { user } = useAuth();
  const isProjectChat = !!projectId;

  // Use appropriate socket hook
  const taskSocket = useSocket(isProjectChat ? null : task?.id);
  const projectSocket = useProjectSocket(isProjectChat ? projectId : null);
  const { messages, typingUsers, sendMessage, emitTyping } = isProjectChat ? projectSocket : taskSocket;

  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else {
      emitTyping();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      sendMessage('', data.url);
      toast.success('File sent');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!task && !projectId) return null;

  const chatTitle = isProjectChat ? task?.title || 'Project Chat' : task?.title;
  const chatSubtitle = isProjectChat ? 'Project Chat Room' : 'Task Chat Room';

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: 380,
        background: 'var(--glass-bg-strong)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderLeft: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 60,
        boxShadow: '-8px 0 40px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '0.95rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 2,
            }}
          >
            {chatTitle}
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 500 }}>
            {chatSubtitle}
          </span>
        </div>
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

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 16px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
            }}
          >
            No messages yet. Start the conversation!
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg) => {
            const isMine = msg.userId === user?.id || msg.sender?.id === user?.id;
            const senderName = msg.sender?.name || 'User';
            const initial = senderName[0]?.toUpperCase();

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'flex',
                  flexDirection: isMine ? 'row-reverse' : 'row',
                  gap: 8,
                  alignItems: 'flex-end',
                }}
              >
                {!isMine && <div className="avatar avatar-sm">{initial}</div>}
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '10px 14px',
                    borderRadius: isMine
                      ? '14px 14px 4px 14px'
                      : '14px 14px 14px 4px',
                    background: isMine
                      ? 'var(--accent-gradient)'
                      : 'var(--glass-bg-strong)',
                    backdropFilter: isMine ? 'none' : 'blur(12px)',
                    border: isMine ? 'none' : '1px solid var(--glass-border)',
                    color: isMine ? '#0b1120' : 'var(--text-primary)',
                    boxShadow: isMine ? '0 4px 12px var(--accent-glow)' : 'var(--shadow-sm)',
                  }}
                >
                  {!isMine && (
                    <p
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: 'var(--accent)',
                        marginBottom: 3,
                      }}
                    >
                      {senderName}
                    </p>
                  )}
                  {msg.fileUrl && (
                    <div style={{ marginBottom: msg.content ? 8 : 0 }}>
                      {msg.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img
                          src={msg.fileUrl}
                          alt="Shared"
                          style={{
                            maxWidth: '100%',
                            borderRadius: 8,
                            display: 'block',
                          }}
                        />
                      ) : (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            color: isMine ? '#0b1120' : 'var(--accent)',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            textDecoration: 'underline',
                          }}
                        >
                          <HiOutlinePaperClip size={14} />
                          Attachment
                        </a>
                      )}
                    </div>
                  )}
                  {msg.content && (
                    <p style={{ fontSize: '0.85rem', lineHeight: 1.45 }}>
                      {msg.content}
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: '0.62rem',
                      marginTop: 4,
                      opacity: 0.6,
                      textAlign: 'right',
                    }}
                  >
                    {format(new Date(msg.createdAt), 'h:mm a')}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              padding: '4px 20px 8px',
              fontSize: '0.72rem',
              color: 'var(--accent)',
              fontStyle: 'italic',
            }}
          >
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--glass-bg)',
        }}
      >
        <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="btn btn-ghost btn-sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{ padding: 6, flexShrink: 0 }}
        >
          <HiOutlinePhotograph size={18} />
        </motion.button>
        <input
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={{ padding: '10px 14px', fontSize: '0.85rem' }}
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="btn btn-primary btn-sm"
          onClick={handleSend}
          disabled={!text.trim()}
          style={{ padding: '10px', flexShrink: 0 }}
        >
          <HiOutlinePaperAirplane size={16} style={{ transform: 'rotate(90deg)' }} />
        </motion.button>
      </div>
    </motion.div>
  );
}
