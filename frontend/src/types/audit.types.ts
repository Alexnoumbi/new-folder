export interface AuditLog {
  _id: string;
  timestamp: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
  entityType: 'USER' | 'ENTERPRISE' | 'KPI' | 'DOCUMENT' | 'REPORT';
  entityId: string;
  changes: any;
  user?: {
    name: string;
    email: string;
  };
  status: 'success' | 'error' | 'warning';
}

