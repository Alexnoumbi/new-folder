import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  TablePagination,
  Checkbox,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  MoreVert,
  Download,
  Visibility,
  Edit,
  Delete
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ArgonTable from './ArgonTable';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  sortable?: boolean;
  filterable?: boolean;
  format?: (value: any) => React.ReactNode;
}

interface ArgonDataTableProps {
  title?: string;
  columns: Column[];
  data: any[];
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  selectable?: boolean;
  actions?: (row: any) => React.ReactNode;
  onRowClick?: (row: any) => void;
  onSelectionChange?: (selected: any[]) => void;
  onExport?: () => void;
  filters?: {
    [key: string]: {
      type: 'select' | 'text' | 'date';
      options?: { value: string; label: string }[];
    };
  };
}

const TableContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
}));

const TableHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  alignItems: 'center',
}));

const ArgonDataTable: React.FC<ArgonDataTableProps> = ({
  title,
  columns,
  data,
  loading = false,
  searchable = true,
  filterable = true,
  sortable = true,
  pagination = true,
  selectable = false,
  actions,
  onRowClick,
  onSelectionChange,
  onExport,
  filters = {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: any }>({});
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);

  const filteredData = useMemo(() => {
    let filtered = data;

    // Recherche globale
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filtres spécifiques
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row =>
          String(row[key]).toLowerCase().includes(String(value).toLowerCase())
        );
      }
    });

    // Tri
    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, activeFilters, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage, pagination]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(paginatedData);
    } else {
      setSelectedRows([]);
    }
    onSelectionChange?.(checked ? paginatedData : []);
  };

  const handleSelectRow = (row: any, checked: boolean) => {
    let newSelection;
    if (checked) {
      newSelection = [...selectedRows, row];
    } else {
      newSelection = selectedRows.filter(item => item.id !== row.id);
    }
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleFilterChange = (field: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setPage(0);
  };

  const tableColumns = [
    ...(selectable ? [{
      id: 'select',
      label: '',
      minWidth: 50,
      align: 'left' as const,
      format: (row: any) => (
        <Checkbox
          checked={selectedRows.some(item => item.id === row.id)}
          onChange={(e) => handleSelectRow(row, e.target.checked)}
        />
      )
    }] : []),
    ...columns.map(col => ({
      ...col,
      format: (value: any, row: any) => {
        if (col.format) return col.format(value);
        return value;
      }
    }))
  ];

  return (
    <TableContainer>
      <TableHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          )}
          {selectedRows.length > 0 && (
            <Chip
              label={`${selectedRows.length} sélectionné(s)`}
              color="primary"
              size="small"
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {searchable && (
            <TextField
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
          )}

          {filterable && (
            <>
              <IconButton
                onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                sx={{ color: 'text.secondary' }}
              >
                <FilterList />
              </IconButton>
              <Menu
                anchorEl={filterMenuAnchor}
                open={Boolean(filterMenuAnchor)}
                onClose={() => setFilterMenuAnchor(null)}
                PaperProps={{
                  sx: { minWidth: 200, p: 2 }
                }}
              >
                {Object.entries(filters).map(([key, config]) => (
                  <Box key={key} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {columns.find(col => col.id === key)?.label || key}
                    </Typography>
                    {config.type === 'select' ? (
                      <FormControl fullWidth size="small">
                        <Select
                          value={activeFilters[key] || ''}
                          onChange={(e) => handleFilterChange(key, e.target.value)}
                        >
                          <MenuItem value="">Tous</MenuItem>
                          {config.options?.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        type={config.type === 'date' ? 'date' : 'text'}
                        value={activeFilters[key] || ''}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                      />
                    )}
                  </Box>
                ))}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Chip
                    label="Effacer"
                    size="small"
                    onClick={clearFilters}
                    sx={{ cursor: 'pointer' }}
                  />
                </Box>
              </Menu>
            </>
          )}

          {onExport && (
            <Tooltip title="Exporter">
              <IconButton onClick={onExport} sx={{ color: 'text.secondary' }}>
                <Download />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </TableHeader>

      <ArgonTable
        columns={tableColumns}
        data={paginatedData}
        loading={loading}
        actions={actions}
        onRowClick={onRowClick}
      />

      {pagination && (
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} sur ${count}`
          }
        />
      )}
    </TableContainer>
  );
};

export default ArgonDataTable; 