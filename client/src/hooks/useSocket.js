import { useState, useEffect, useCallback, useRef } from 'react';
import socket from '../services/socket';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export function useSocket(taskId) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  // Register user on socket connect for notifications
  useEffect(() => {
    if (user?.id) {
      socket.emit('registerUser', user.id);
    }
  }, [user]);

  useEffect(() => {
    if (!taskId) return;

    // Fetch existing messages
    api.get(`/tasks/${taskId}/messages`).then(({ data }) => {
      setMessages(data);
    });

    // Join room
    socket.emit('joinRoom', taskId);

    // Listen for new messages
    const onNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const onUserTyping = ({ userName }) => {
      setTypingUsers((prev) => (prev.includes(userName) ? prev : [...prev, userName]));
    };

    const onUserStopTyping = ({ userName }) => {
      setTypingUsers((prev) => prev.filter((n) => n !== userName));
    };

    socket.on('newMessage', onNewMessage);
    socket.on('userTyping', onUserTyping);
    socket.on('userStopTyping', onUserStopTyping);

    return () => {
      socket.emit('leaveRoom', taskId);
      socket.off('newMessage', onNewMessage);
      socket.off('userTyping', onUserTyping);
      socket.off('userStopTyping', onUserStopTyping);
    };
  }, [taskId]);

  const sendMessage = useCallback(
    (content, fileUrl = null) => {
      if (!taskId || !user) return;
      socket.emit('sendMessage', {
        taskId,
        userId: user.id,
        content,
        fileUrl,
      });
    },
    [taskId, user]
  );

  const emitTyping = useCallback(() => {
    if (!taskId || !user) return;
    socket.emit('typing', { taskId, userName: user.name });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { taskId, userName: user.name });
    }, 2000);
  }, [taskId, user]);

  return { messages, typingUsers, sendMessage, emitTyping };
}

// Hook for project-level chat
export function useProjectSocket(projectId) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      socket.emit('registerUser', user.id);
    }
  }, [user]);

  useEffect(() => {
    if (!projectId) return;

    // Fetch existing project messages
    api.get(`/projects/${projectId}/messages`).then(({ data }) => {
      setMessages(data);
    });

    socket.emit('joinProjectRoom', projectId);

    const onNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const onUserTyping = ({ userName }) => {
      setTypingUsers((prev) => (prev.includes(userName) ? prev : [...prev, userName]));
    };

    const onUserStopTyping = ({ userName }) => {
      setTypingUsers((prev) => prev.filter((n) => n !== userName));
    };

    socket.on('newProjectMessage', onNewMessage);
    socket.on('userTyping', onUserTyping);
    socket.on('userStopTyping', onUserStopTyping);

    return () => {
      socket.emit('leaveProjectRoom', projectId);
      socket.off('newProjectMessage', onNewMessage);
      socket.off('userTyping', onUserTyping);
      socket.off('userStopTyping', onUserStopTyping);
    };
  }, [projectId]);

  const sendMessage = useCallback(
    (content, fileUrl = null) => {
      if (!projectId || !user) return;
      socket.emit('sendProjectMessage', {
        projectId,
        userId: user.id,
        content,
        fileUrl,
      });
    },
    [projectId, user]
  );

  const emitTyping = useCallback(() => {
    if (!projectId || !user) return;
    socket.emit('projectTyping', { projectId, userName: user.name });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('projectStopTyping', { projectId, userName: user.name });
    }, 2000);
  }, [projectId, user]);

  return { messages, typingUsers, sendMessage, emitTyping };
}
