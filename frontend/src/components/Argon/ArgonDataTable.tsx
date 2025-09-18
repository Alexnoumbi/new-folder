import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TablePagination,
  TextField,
  IconButton,
  Typography
} from '@mui/material';
import { GetApp as DownloadIcon } from '@mui/icons-material';

export interface ArgonDataTableProps {
  title?: string;
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
  pagination?: boolean;
  enableExport?: boolean;
  exportFilename?: string;
  onExport?: () => void;
  filters?: Record<string, any>;
  onRowClick?: (row: any) => void;
}

const ArgonDataTable: React.FC<ArgonDataTableProps> = ({
  title,
  data,
  columns,
  loading,
  actions,
  searchable,
  sortable,
  pagination,
  enableExport,
  exportFilename,
  onExport,
  filters,
  onRowClick
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleSort = (columnId: string) => {
    const isAsc = sortColumn === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(columnId);
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  // Filter data based on search query
  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Sort data if a column is selected
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {title && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        {searchable && (
          <TextField
            size="small"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={handleSearch}
            sx={{ minWidth: 300 }}
          />
        )}
        {enableExport && (
          <IconButton onClick={handleExport} title="Exporter">
            <DownloadIcon />
          </IconButton>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  style={{ minWidth: column.minWidth }}
                  onClick={() => sortable && column.sortable && handleSort(column.id)}
                  sx={sortable && column.sortable ? { cursor: 'pointer' } : undefined}
                >
                  {column.label}
                  {sortable && column.sortable && sortColumn === column.id && (
                    <Box component="span" sx={{ ml: 1 }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </Box>
                  )}
                </TableCell>
              ))}
              {actions && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {row[column.id]}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell>
                    {actions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination !== false && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Box>
  );
};

export default ArgonDataTable;
