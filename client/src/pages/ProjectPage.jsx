import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePlus,
  HiOutlineUserAdd,
  HiOutlineChatAlt2,
  HiOutlineClipboardList,
  HiOutlineCog,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineDocumentText,
  HiOutlineUpload,
} from 'react-icons/hi';

import api from '../services/api';
import toast from 'react-hot-toast';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import ChatPanel from '../components/chat/ChatPanel';
import InviteMemberModal from '../components/projects/InviteMemberModal';
import { useAuth } from '../context/AuthContext';

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [modalTask, setModalTask] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [chatTask, setChatTask] = useState(null);
  const [showProjectChat, setShowProjectChat] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [files, setFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const { data } = await api.get(`/projects/${id}/files`);
      setFiles(data);
    } catch (err) {
      toast.error('Failed to load project files');
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'files') fetchFiles();
  }, [activeTab, id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', id);
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchFiles();
      toast.success('File uploaded successfully');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const isAdmin = project?.myRole === 'admin';
  const canEdit = ['admin', 'editor'].includes(project?.myRole);

  const tasks = project?.tasks || [];
  const members = project?.memberships || [];

  const taskCounts = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  }), [tasks]);

  const handleCreateTask = () => {
    setModalTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setModalTask(task);
    setShowTaskModal(true);
  };

  const handleSaveTask = async (formData) => {
    try {
      if (modalTask?.id) {
        await api.put(`/tasks/${modalTask.id}`, formData);
      } else {
        await api.post('/tasks', { ...formData, projectId: parseInt(id) });
      }
      toast.success(modalTask?.id ? 'Task updated' : 'Task created');
      fetchProject();
    } catch (err) {
      toast.error('Failed to save task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchProject();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      toast.success('Member removed');
      fetchProject();
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: 200, height: 24, borderRadius: 8 }} />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass"
        style={{
          position: 'sticky',
          top: 55,
          zIndex: 40,
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 600, lineHeight: 1.2 }}>
              {project.name}
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {members.length} member{members.length !== 1 ? 's' : ''} · {tasks.length} task{tasks.length !== 1 ? 's' : ''} · Your role: {project.myRole}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="btn btn-ghost btn-sm"
            onClick={() => setShowProjectChat(true)}
            style={{ gap: 4 }}
          >
            <HiOutlineChatAlt2 size={16} />
            Chat
          </motion.button>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="btn btn-ghost btn-sm"
              onClick={() => setShowInvite(true)}
              style={{ gap: 4 }}
            >
              <HiOutlineUserAdd size={16} />
              Invite
            </motion.button>
          )}
          {canEdit && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="btn btn-primary btn-sm"
              onClick={handleCreateTask}
              style={{ gap: 4 }}
            >
              <HiOutlinePlus size={15} />
              New Task
            </motion.button>
          )}
        </div>
      </motion.div>

      <div style={{ display: 'flex' }}>
        {/* Members Panel */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="glass"
          style={{
            width: 240,
            padding: '20px 12px',
            borderRight: '1px solid var(--glass-border)',
            height: 'calc(100vh - 110px)',
            position: 'sticky',
            top: 110,
            flexShrink: 0,
            overflowY: 'auto',
          }}
        >
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '0 12px',
              marginBottom: 12,
            }}
          >
            Members
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {members.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div className="avatar avatar-sm">
                  {m.user?.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {m.user?.name}
                  </p>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {m.role}
                  </p>
                </div>
                {isAdmin && m.userId !== user?.id && (
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleRemoveMember(m.userId)}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: 4, color: 'var(--priority-high)' }}
                    title="Remove"
                  >
                    <HiOutlineX size={13} />
                  </motion.button>
                )}
              </div>
            ))}
          </div>

          {/* Task Stats */}
          <div style={{ marginTop: 24, padding: '0 12px' }}>
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 12,
              }}
            >
              Stats
            </p>
            {[
              { label: 'Total', value: taskCounts.total, color: 'var(--text-primary)' },
              { label: 'Pending', value: taskCounts.pending, color: 'var(--status-pending)' },
              { label: 'In Progress', value: taskCounts['in-progress'], color: 'var(--status-progress)' },
              { label: 'Completed', value: taskCounts.completed, color: 'var(--status-completed)' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <span>{stat.label}</span>
                <span style={{ fontWeight: 600, color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </motion.aside>

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            padding: '32px',
            minHeight: 'calc(100vh - 57px)',
            transition: 'margin-right 0.4s ease',
            marginRight: chatTask || showProjectChat ? 380 : 0,
          }}
        >
          {/* Description */}
          {project.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                marginBottom: 24,
                lineHeight: 1.5,
                maxWidth: 600,
              }}
            >
              {project.description}
            </motion.p>
          )}

          {/* File Upload Hidden Input */}
          <input type="file" id="projectFileUpload" hidden onChange={handleFileUpload} />

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--border)', marginBottom: 24, paddingBottom: 8 }}>
            <button 
              onClick={() => setActiveTab('tasks')} 
              style={{ background: 'none', border: 'none', color: activeTab === 'tasks' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: activeTab === 'tasks' ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '1rem', display: 'flex', gap: 6, alignItems: 'center' }}
            >
              <HiOutlineClipboardList size={18} /> Tasks ({tasks.length})
            </button>
            <button 
               onClick={() => setActiveTab('files')}
               style={{ background: 'none', border: 'none', color: activeTab === 'files' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: activeTab === 'files' ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '1rem', display: 'flex', gap: 6, alignItems: 'center' }}
            >
              <HiOutlineDocumentText size={18} /> Files
            </button>
          </div>

          {activeTab === 'tasks' ? (
            <>
              {tasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    textAlign: 'center',
                    padding: '60px 24px',
                    color: 'var(--text-muted)',
                  }}
                >
                  <HiOutlineClipboardList size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p style={{ fontSize: '1rem', marginBottom: 4 }}>No tasks yet</p>
                  <p style={{ fontSize: '0.82rem' }}>
                    {canEdit ? 'Create a task to get started' : 'No tasks have been created yet'}
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
                    {tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={canEdit ? handleEditTask : () => {}}
                        onDelete={canEdit ? handleDeleteTask : () => {}}
                        onOpenChat={setChatTask}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                 <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 500 }}>Shared Project Files</h2>
                 {(canEdit || project.myRole === 'viewer') && (
                   <label htmlFor="projectFileUpload" className="btn btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                     <HiOutlineUpload size={15} />
                     {uploadingFile ? 'Uploading...' : 'Upload File'}
                   </label>
                 )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                 {files.map(f => (
                   <div key={f.id} className="glass" style={{ padding: 12, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                     {f.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img src={f.url} alt={f.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4 }} />
                     ) : (
                        <div style={{ width: '100%', height: 120, background: 'rgba(255,255,255,0.05)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <HiOutlineDocumentText size={40} color="var(--text-muted)" />
                        </div>
                     )}
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <a href={f.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</a>
                       <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{(f.size / 1024).toFixed(1)} KB • {f.uploader?.name}</span>
                     </div>
                   </div>
                 ))}
                 {files.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No files uploaded yet. Be the first to share one!</p>}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          task={modalTask}
          onClose={() => setShowTaskModal(false)}
          onSave={handleSaveTask}
          projectId={parseInt(id)}
        />
      )}

      {/* Invite Modal */}
      {showInvite && (
        <InviteMemberModal
          projectId={id}
          onClose={() => setShowInvite(false)}
          onInvited={(member) => fetchProject()}
        />
      )}

      {/* Task Chat Panel */}
      <AnimatePresence>
        {chatTask && (
          <ChatPanel task={chatTask} onClose={() => setChatTask(null)} />
        )}
      </AnimatePresence>

      {/* Project Chat Panel (reusing ChatPanel with project context) */}
      <AnimatePresence>
        {showProjectChat && (
          <ChatPanel
            task={{ id: null, title: project.name }}
            projectId={parseInt(id)}
            onClose={() => setShowProjectChat(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
