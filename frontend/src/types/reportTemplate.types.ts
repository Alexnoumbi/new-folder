export interface ReportTemplate {
  _id: string;
  name: string;
  description: string;
  type: 'PORTFOLIO' | 'PROJECT' | 'KPI' | 'COMPLIANCE' | 'CUSTOM' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  format: 'PDF' | 'EXCEL' | 'WORD';
  sections: TemplateSection[];
  filters: TemplateFilters;
  layout: TemplateLayout;
  isDefault: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    nom: string;
    prenom: string;
    email: string;
  };
}

export type TemplateSection = 
  | 'STATISTICS'
  | 'ENTREPRISES'
  | 'INDICATORS'
  | 'KPIS'
  | 'VISITS'
  | 'FRAMEWORKS'
  | 'PORTFOLIOS'
  | 'COMPLIANCE'
  | 'CHARTS'
  | 'SUMMARY'
  | 'RECOMMENDATIONS';

export interface TemplateFilters {
  region?: string;
  secteur?: string;
  status?: string;
  dateRange?: 'LAST_MONTH' | 'LAST_QUARTER' | 'LAST_YEAR' | 'CUSTOM';
  customFilters?: Record<string, any>;
}

export interface TemplateLayout {
  orientation?: 'PORTRAIT' | 'LANDSCAPE';
  pageSize?: 'A4' | 'A3' | 'LETTER';
  includeHeader?: boolean;
  includeFooter?: boolean;
  includeTableOfContents?: boolean;
  colorScheme?: 'DEFAULT' | 'BLUE' | 'GREEN' | 'PROFESSIONAL';
}

export interface CreateTemplateData {
  name: string;
  description: string;
  type: ReportTemplate['type'];
  format: ReportTemplate['format'];
  sections?: TemplateSection[];
  filters?: TemplateFilters;
  layout?: TemplateLayout;
  isDefault?: boolean;
}

