import api from './api';

export interface SystemStats {
  // Legacy flat fields (for AdminMonitoring)
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  networkIO?: number;
  cpuTrend?: string;
  memoryTrend?: string;
  diskTrend?: string;
  securityAlerts?: number;
  securityTrend?: string;
  // Structure used by SystemStats component
  system: {
    cpu: number;
    memory: { used: number; free: number; total: number; };
    disk: { used: number; free: number; total: number; };
  };
  requests: { averageResponseTime: number; perMinute: number; };
  uptime: number;
}

export interface StorageStats {
  totalSize: number;
  fileCount: number;
  uploadDirectory: string;
}

export interface SecurityAlert {
  id: string;
  type: 'failedLogin' | 'suspiciousIP' | 'blockedIP';
  message: string;
  ipAddress: string;
  timestamp: string;
  resolved: boolean;
}

export interface BackupStatus {
  backups: Array<{
    filename: string;
    size: number;
    createdAt: string;
  }>;
  lastBackup: {
    filename: string;
    size: number;
    createdAt: string;
  } | null;
}

// Monitoring API functions
export const getSystemStats = async (): Promise<SystemStats> => {
  const { data } = await api.get('/system/stats');
  return data;
};

export const getStorageStats = async (): Promise<StorageStats> => {
  const { data } = await api.get('/system/storage');
  return data;
};

export const getSecurityAlerts = async (): Promise<SecurityAlert[]> => {
  const { data } = await api.get('/system/security/alerts');
  return data;
};

export const resolveSecurityAlert = async (alertId: string): Promise<void> => {
  await api.put(`/system/security/alerts/${alertId}/resolve`);
};

export const getBackupStatus = async (): Promise<BackupStatus> => {
  const { data } = await api.get('/system/backups');
  return data;
};

export const initiateBackup = async (): Promise<void> => {
  await api.post('/system/backups');
};

const monitoringService = {
  getSystemStats,
};

export default monitoringService;
