import { io } from 'socket.io-client';

const URL = import.meta.env.DEV ? 'http://localhost:5000' : undefined;

const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  auth: (cb) => {
    const token = localStorage.getItem('token');
    cb({ token });
  },
});

export default socket;
