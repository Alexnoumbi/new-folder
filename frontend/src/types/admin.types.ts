import { User } from './auth.types';

export interface Report {
  id: string;
  title: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  status: "pending" | "completed" | "failed" | "in-progress";
  createdAt: string;
  author: string;
  progress?: number;
  startDate: string;
  endDate: string;
  format: 'pdf' | 'excel';
  _id?: string;
}

export interface ReportParams {
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  startDate: Date | null;
  endDate: Date | null;
  format: 'pdf' | 'excel';
  includeCharts: boolean;
}

export interface KPI {
  _id: string;
  name: string;
  description: string;
  type: "NUMERIC" | "PERCENTAGE" | "CURRENCY" | "BOOLEAN";
  unit: string;
  targetValue: number;
  minValue?: number;
  maxValue?: number;
  frequency: "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL";
  enterprise?: string;
  currentValue?: number;
  trend?: 'up' | 'down' | 'flat';
}

export interface KPIFormData extends Omit<KPI, '_id'> {}

// KPIHistory entries used throughout the UI
export interface KPIHistory {
  name: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
  date: string;
  change?: number;
}

export interface SecurityAlert {
  id: string;
  type: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message?: string;
  timestamp: string;
  resolved: boolean;
}

export interface SecurityStatus {
  alerts: SecurityAlert[];
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  lastScan: string;
  securityScore?: number;
}

export interface ComplianceCategory {
  name: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  score: number;
  lastChecked: string;
  passedControls?: number;
  totalControls?: number;
  lastAssessment?: string;
}

export interface ComplianceStatus {
  categories: ComplianceCategory[];
  overallScore: number;
  lastUpdate: string;
  passedControls?: number;
  pendingControls?: number;
  failedControls?: number;
}

export interface PortfolioStats {
  totalValue: number;
  growth: number;
  assets: {
    type: string;
    value: number;
    change: number;
  }[];
  performance: {
    period: string;
    value: number;
  }[];
  totalEnterprises?: number;
  activeConventions?: number;
  kpisOnTrack?: number;
  totalKPIs?: number;
}

export interface SystemInfo {
  startTime: number;
  requests: {
    total: number;
    perMinute: number;
    responseTime: number[];
  };
  system: {
    cpu: number;
    memory: {
      total: number;
      used: number;
      free: number;
    };
    disk: {
      total: number;
      used: number;
      free: number;
    };
    osInfo?: {
      platform: string;
      version: string;
      architecture: string;
    };
  };
  usage: {
    mobile: number;
    web: number;
  };
  security: {
    failedLogins: number;
    suspiciousIPs: string[];
    blockedIPs: string[];
    lastLogin?: Date;
    securityUpdatesAvailable?: boolean;
  };
  process?: {
    activeUsers: number;
    uptime: number;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
  };
}
