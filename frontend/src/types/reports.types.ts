import { BaseEntity } from './interfaces';

// Report interfaces
export interface Report extends BaseEntity {
    _id: string;
    id?: string;  // Optional for backward compatibility
    name: string;
    title: string;  // Made required since it's used in display
    type: string;
    format: string;
    status: 'completed' | 'in-progress' | 'pending' | 'failed';  // Added strict typing
    generatedBy: string;
    downloadUrl?: string;
    error?: string;
    createdAt: string;  // Changed to string only for consistency
    progress: number;  // Made required since it's used in UI
    author: string;  // Made required since it's displayed
    startDate?: Date;
    endDate?: Date;
}

export interface ReportParams {
    type: 'monthly' | 'quarterly' | 'annual' | 'custom';
    format: 'pdf' | 'excel';
    startDate: Date | null;
    endDate: Date | null;
    includeCharts: boolean;
    title?: string;
    dateDebut?: string;
    dateFin?: string;
    entrepriseId?: string;
    additionalParams?: {
        [key: string]: any;
    };
}

// Portfolio interfaces
export interface PortfolioStats {
    totalConventions: number;
    conventionsActives: number;
    totalKPIs: number;
    kpisEnCours: number;
    totalEnterprises?: number;
    activeConventions?: number;
    kpisOnTrack?: number;
    totalEntreprises?: number;  // Added for backward compatibility
}
