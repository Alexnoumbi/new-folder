import { PropsWithChildren } from 'react';

export interface ArgonDataTableProps {
  data: any[];
  columns: {
    id: string;
    label: string;
    minWidth?: number;
    sortable?: boolean;
    filterable?: boolean;
  }[];
  loading?: boolean;
  actions?: (row: any) => React.ReactNode;
  searchable?: boolean;
  sortable?: boolean;
  enableExport?: boolean;
  exportFilename?: string;
}

export const ArgonDataTable: React.FC<PropsWithChildren<ArgonDataTableProps>> = ({
  data,
  columns,
  loading,
  actions,
  searchable,
  sortable,
  enableExport,
  exportFilename,
  children
}) => {
  // Component implementation...
  return null;
};
