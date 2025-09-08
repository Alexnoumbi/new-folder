import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any, row?: any) => string | React.ReactNode;
}

interface ArgonTableProps {
  title?: string;
  columns: Column[];
  data: any[];
  loading?: boolean;
  actions?: (row: any) => React.ReactNode;
  onRowClick?: (row: any) => void;
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  overflow: 'hidden',
}));

const StyledTable = styled(Table)(({ theme }) => ({
  '& .MuiTableCell-head': {
    backgroundColor: '#f8fafc',
    color: '#374151',
    fontWeight: 600,
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e5e7eb',
  },
  '& .MuiTableCell-body': {
    fontSize: '0.875rem',
    borderBottom: '1px solid #f3f4f6',
  },
  '& .MuiTableRow-root': {
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#f8fafc',
      transform: 'scale(1.01)',
    },
    '&:last-child td': {
      borderBottom: 0,
    },
  },
}));

const StatusChip = styled(Chip)<{ status: string }>(({ status }) => ({
  fontWeight: 500,
  fontSize: '0.75rem',
  backgroundColor: 
    status === 'active' ? '#d1fae5' :
    status === 'pending' ? '#fef3c7' :
    status === 'inactive' ? '#fee2e2' :
    '#e5e7eb',
  color: 
    status === 'active' ? '#065f46' :
    status === 'pending' ? '#92400e' :
    status === 'inactive' ? '#991b1b' :
    '#6b7280',
}));

const ArgonTable: React.FC<ArgonTableProps> = ({
  title,
  columns,
  data,
  loading = false,
  actions,
  onRowClick
}) => {
  return (
    <Box>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
          {title}
        </Typography>
      )}
      <StyledTableContainer>
        <StyledTable stickyHeader aria-label="argon table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
              {actions && (
                <TableCell align="center" style={{ minWidth: 100 }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center">
                  <Box sx={{ py: 4 }}>
                    <Typography color="text.secondary">Chargement...</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center">
                  <Box sx={{ py: 4 }}>
                    <Typography color="text.secondary">Aucune donnée disponible</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  hover
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.id === 'status' ? (
                          <StatusChip
                            label={value}
                            size="small"
                            status={value?.toLowerCase()}
                          />
                        ) : column.id === 'avatar' ? (
                          <Avatar
                            src={value}
                            sx={{ width: 32, height: 32 }}
                          >
                            {row.name?.charAt(0)}
                          </Avatar>
                        ) : column.format ? (
                          column.format(value, row)
                        ) : (
                          value
                        )}
                      </TableCell>
                    );
                  })}
                  {actions && (
                    <TableCell align="center">
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
    </Box>
  );
};

export default ArgonTable; 