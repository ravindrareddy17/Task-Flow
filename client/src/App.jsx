import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import PersonalTasksPage from './pages/PersonalTasksPage';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import CreateProjectModal from './components/projects/CreateProjectModal';
import { useProjects } from './hooks/useProjects';
import { useTasks } from './hooks/useTasks';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { token } = useAuth();
  return !token ? children : <Navigate to="/" replace />;
}

function AppLayout() {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks();
  const { createProject } = useProjects();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreateProject, setShowCreateProject] = useState(false);

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar
        onCreateTask={() => {
          window.dispatchEvent(new CustomEvent('openTaskModal'));
        }}
      />
      <Routes>
        <Route path="/projects/:id" element={<ProjectPage />} />
        <Route
          path="*"
          element={
            <div style={{ display: 'flex' }}>
              <Sidebar
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                taskCounts={taskCounts}
                onCreateProject={() => setShowCreateProject(true)}
              />
              <Routes>
                <Route
                  path="/"
                  element={
                    <DashboardPage
                      tasks={tasks}
                      loading={loading}
                      createTask={createTask}
                      updateTask={updateTask}
                      deleteTask={deleteTask}
                      activeFilter={activeFilter}
                      taskCounts={taskCounts}
                    />
                  }
                />
                <Route path="/personal" element={<PersonalTasksPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          }
        />
      </Routes>

      {/* Create Project Modal */}
      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onCreate={createProject}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <SignupPage />
          </GuestRoute>
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
