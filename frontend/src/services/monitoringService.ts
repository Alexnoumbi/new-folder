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

export const getSystemStats = async (): Promise<SystemStats> => {
  // Stub returning safe defaults and legacy fields
  return {
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkIO: 0,
    cpuTrend: '0%',
    memoryTrend: '0%',
    diskTrend: '0%',
    securityAlerts: 0,
    securityTrend: '0',
    system: {
      cpu: 0,
      memory: { used: 0, free: 0, total: 1 },
      disk: { used: 0, free: 0, total: 1 },
    },
    requests: { averageResponseTime: 0, perMinute: 0 },
    uptime: 0,
  };
};

const monitoringService = {
  getSystemStats,
};

export default monitoringService;
