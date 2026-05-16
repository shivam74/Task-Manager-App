import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { socket } from '../services/socket';
import { AuthContext } from './AuthContext';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const { user } = useContext(AuthContext);

  const fetchTasks = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/tasks${query}`);
      setTasks(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.on('taskCreated', (task) => {
        setTasks((prev) => [task, ...prev]);
      });
      socket.on('taskUpdated', (updatedTask) => {
        setTasks((prev) => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
      });
      socket.on('taskDeleted', (id) => {
        setTasks((prev) => prev.filter(t => t._id !== id));
      });

      return () => {
        socket.disconnect();
        socket.off('taskCreated');
        socket.off('taskUpdated');
        socket.off('taskDeleted');
      };
    }
  }, [user]);

  const createTask = async (taskData) => {
    const res = await api.post('/tasks', taskData);
    return res.data.data;
  };

  const updateTask = async (id, taskData) => {
    const res = await api.put(`/tasks/${id}`, taskData);
    return res.data.data;
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
  };

  const uploadFile = async (taskId, file) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/files/${taskId}`, formData, {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
      });
      return res.data.data;
  };

  return (
    <TaskContext.Provider value={{ tasks, loading, pagination, fetchTasks, createTask, updateTask, deleteTask, uploadFile }}>
      {children}
    </TaskContext.Provider>
  );
};
