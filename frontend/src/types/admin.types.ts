// Re-export all interfaces from specialized type files
export * from './interfaces';
export * from './security.types';
export * from './kpi.types';
export * from './reports.types';

// Admin Dashboard specific types
export interface AdminStats {
    totalEntreprises: number;
    utilisateursActifs: number;
    kpiValides: number;
    alertes: number;
    evolutionEntreprises: Array<{
        _id: {
            year: number;
            month: number;
        };
        count: number;
    }>;
    repartitionStatus: Array<{
        status: string;
        count: number;
    }>;
    dernieresActivites: Array<{
        _id: string;
        action: string;
        description: string;
        timestamp: string;
        user?: {
            _id: string;
            nom: string;
            email: string;
        };
    }>;
}
