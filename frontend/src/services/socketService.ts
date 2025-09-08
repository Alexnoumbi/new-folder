import io from 'socket.io-client';

class SocketService {
  private socket: ReturnType<typeof io> | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    if (this.socket?.connected) {
      return;
    }

    const token = localStorage.getItem('token'); // ou votre méthode de récupération du token
    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Set up indicator event listeners
    this.socket.on('indicator:updated', (data: any) => {
      this.notifyListeners('indicator:updated', data);
    });

    this.socket.on('indicator:validated', (data: any) => {
      this.notifyListeners('indicator:validated', data);
    });

    this.socket.on('indicator:pending-validation', (data: any) => {
      this.notifyListeners('indicator:pending-validation', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  private notifyListeners(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  get isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
