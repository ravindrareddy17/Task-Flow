import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export function usePersonalTasks() {
  const [personalTasks, setPersonalTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPersonalTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/personal-tasks');
      setPersonalTasks(data);
    } catch (err) {
      toast.error('Failed to load personal tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonalTasks();
  }, [fetchPersonalTasks]);

  const createPersonalTask = async (taskData) => {
    const { data } = await api.post('/personal-tasks', taskData);
    setPersonalTasks((prev) => [data, ...prev]);
    toast.success('Personal task created');
    return data;
  };

  const updatePersonalTask = async (id, taskData) => {
    const { data } = await api.put(`/personal-tasks/${id}`, taskData);
    setPersonalTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    toast.success('Task updated');
    return data;
  };

  const deletePersonalTask = async (id) => {
    await api.delete(`/personal-tasks/${id}`);
    setPersonalTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success('Task deleted');
  };

  return { personalTasks, loading, fetchPersonalTasks, createPersonalTask, updatePersonalTask, deletePersonalTask };
}
