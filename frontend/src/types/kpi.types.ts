export interface KPI {
    _id: string;
    name: string;
    code?: string;
    description?: string;
    type: 'NUMERIC' | 'PERCENTAGE' | 'CURRENCY' | 'BOOLEAN';
    unit: string;
    targetValue: number;
    minValue?: number | null;
    maxValue?: number | null;
    frequency: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
    currentValue?: number;
    enterprise?: string;
    linkedIndicators?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface KPIFormData {
    name: string;
    code?: string;
    description?: string;
    type: 'NUMERIC' | 'PERCENTAGE' | 'CURRENCY' | 'BOOLEAN';
    unit: string;
    targetValue: number;
    minValue?: number | null;
    maxValue?: number | null;
    frequency: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
    enterprise?: string;
}

export interface KPIHistory {
    _id: string;
    kpiId: string;
    name: string;
    unit: string;
    value: number;
    comment?: string;
    submittedAt: string;
    submittedBy: string;
    status: 'pending' | 'validated' | 'rejected';
    validatedBy?: string;
    validatedAt?: string;
    validationComment?: string;
    trend?: 'up' | 'down' | 'flat';
    change?: number;
}

export interface ComplianceCategory {
    id: string;
    name: string;
    description: string;
    requirements: string[];
    weight: number;
    taux: number;
    total: number;
    totalControls: number;
    lastAssessment?: string;
}

export interface ComplianceStatus {
    overallScore: number;
    lastUpdated: string;
    passedControls: number;
    pendingControls: number;
    failedControls: number;
    categories: {
        categoryId: string;
        name: string;
        score: number;
        status: 'compliant' | 'partial' | 'non-compliant';
        taux: number;
        total: number;
        totalControls: number;
        lastAssessment?: string;
        items: Array<{
            id: string;
            requirement: string;
            status: 'compliant' | 'partial' | 'non-compliant';
            evidence?: string;
            lastChecked: string;
            nextCheck?: string;
            comments?: string;
        }>;
    }[];
    trends: {
        period: string;
        score: number;
    }[];
    recommendations: Array<{
        id: string;
        priority: 'high' | 'medium' | 'low';
        description: string;
        category: string;
        dueDate?: string;
        status: 'open' | 'in-progress' | 'completed';
    }>;
}
