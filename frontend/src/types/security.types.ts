export interface SecurityAlert {
  _id: string;
  type: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved' | 'in_progress';
  location?: string;  // Optional location field
  details?: any;      // Optional details field
}

export interface SecurityMetrics {
  failedLogins: number;
  failedLogins24h: number;
  suspiciousActivities: number;
  suspiciousActivities24h: number;
  vulnerabilities: number;
  alerts: {
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

export interface SecurityStatus {
  securityScore: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdate: string;
  metrics: SecurityMetrics;
}
