import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (projectData) => {
    const { data } = await api.post('/projects', projectData);
    setProjects((prev) => [data, ...prev]);
    toast.success('Project created');
    return data;
  };

  const updateProject = async (id, projectData) => {
    const { data } = await api.put(`/projects/${id}`, projectData);
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    toast.success('Project updated');
    return data;
  };

  const deleteProject = async (id) => {
    await api.delete(`/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.success('Project deleted');
  };

  return { projects, loading, fetchProjects, createProject, updateProject, deleteProject };
}
