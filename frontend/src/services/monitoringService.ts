import api from './api';

export interface SystemStats {
  system: {
    cpu: number;
    memory: {
      total: number;
      used: number;
      free: number;
      percentage: number;
    };
    disk: {
      total: number;
      used: number;
      free: number;
      percentage: number;
    };
    osInfo: {
      platform: string;
      type: string;
      release: string;
      version: string;
      architecture: string;
      hostname: string;
    };
  };
  process: {
    uptime: number;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    pid: number;
    nodeVersion: string;
  };
  requests: {
    total: number;
    perMinute: number;
    errors: number;
    successRate: number;
    averageResponseTime?: number;
  };
  database: {
    status: string;
    connections: number;
    responseTime: number;
  };
  startTime: number;
  uptime?: number;
}

export interface SecurityAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  message: string;
  ipAddress?: string;
  timestamp: string | Date;
  resolved: boolean;
}

export interface StorageStats {
  total: number;
  used: number;
  free: number;
  percentage: number;
  totalSize?: number;
  fileCount?: number;
  uploads: {
    total: number;
    size: number;
  };
}

export interface BackupStatus {
  lastBackup: {
    createdAt: Date | string;
    size: number;
  };
  nextBackup: Date;
  status: 'success' | 'failed' | 'pending';
  size: number;
  backups: Array<{
    filename: string;
    date?: Date;
    createdAt?: Date | string;
    size: number;
  }>;
}

export const getSystemStats = async (): Promise<SystemStats> => {
  try {
    const response = await api.get('/system/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching system stats:', error);
    throw error;
  }
};

export const getSystemInfo = async (): Promise<any> => {
  try {
    const response = await api.get('/system/info');
    return response.data;
  } catch (error) {
    console.error('Error fetching system info:', error);
    throw error;
  }
};

export default {
  getSystemStats,
  getSystemInfo
};
