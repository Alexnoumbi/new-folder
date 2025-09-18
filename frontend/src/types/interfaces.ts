// Base interfaces for reuse
export interface BaseEntity {
    _id: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UserInfo {
    _id: string;
    nom: string;
    email: string;
}

export interface Timestamp {
    timestamp: string;
}

export interface WithUser {
    user?: UserInfo;
}

export interface WithDescription {
    description: string;
}

// Activity and Audit
export interface Activity extends BaseEntity, Timestamp, WithUser, WithDescription {
    action: string;
    details?: any;
}

export interface AuditLog extends Activity {
    type: string;
    ip?: string;
    location?: string;
}
