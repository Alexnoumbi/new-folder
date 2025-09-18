export interface ComplianceItem {
    id: string;
    status: 'compliant' | 'non-compliant' | 'partial';
}

export interface ComplianceCategory {
    categoryId: string;
    name: string;
    score: number;
    status: 'compliant' | 'partial' | 'non-compliant';
    lastAssessment: string;
    items: ComplianceItem[];
}

export interface ComplianceStatus {
    overallScore: number;
    passedControls: number;
    pendingControls: number;
    failedControls: number;
    categories: ComplianceCategory[];
}
