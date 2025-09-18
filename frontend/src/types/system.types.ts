export interface SystemMemoryInfo {
  used: number;
  total: number;
  free: number;
}

export interface SystemDiskInfo {
  used: number;
  total: number;
  free: number;
}

export interface SystemRequestsInfo {
  perMinute: number;
  total: number;
}

export interface SystemOSInfo {
  platform: string;
  type: string;
  release: string;
  architecture: string;
  version: string;
}

export interface SystemInfo {
  system: {
    osInfo: SystemOSInfo;
    cpu: number;
    memory: SystemMemoryInfo;
    disk: SystemDiskInfo;
  };
  process?: {
    uptime: number;
  };
  requests: SystemRequestsInfo;
  startTime: number;
}
