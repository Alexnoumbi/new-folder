import socketIOClient from 'socket.io-client';
import { getCurrentUser } from './authService';

interface SocketOptions {
  query?: {
    userId: string;
    userType?: 'entreprise' | 'admin';
  };
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  timeout?: number;
}

// Use permissive any to avoid typing conflicts with socket.io-client versions
let socket: any = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

export const initializeSocket = (): any | null => {
  if (socket) return socket;

  const user = getCurrentUser();
  if (!user?.id) return null;

  const options: SocketOptions = {
    query: {
      userId: user.id,
      userType: user.typeCompte
    },
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    timeout: 10000
  };

  socket = socketIOClient(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', options);

  const s = socket;
  if (!s) return null;

  s.on('connect', () => {
    console.log('Socket connected');
    reconnectAttempts = 0;
  });

  s.on('connect_error', (error: Error) => {
    console.error('Socket connection error:', error);
    reconnectAttempts++;

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      disconnectSocket();
    }
  });

  s.on('disconnect', (reason: string) => {
    console.log('Socket disconnected:', reason);
    if (reason === 'io server disconnect') {
      // Server initiated disconnect, attempt to reconnect
      s.connect?.();
    }
  });

  s.on('error', (error: Error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = (): any | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect?.();
  }
  reconnectAttempts = 0;
};

export const isSocketConnected = (): boolean => {
  return !!socket && !!socket.connected;
};
