import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Paper,
  Toolbar,
  Chip,
} from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import EmptyState from './EmptyState';

export default function DataTable({
  columns,
  data,
  loading,
  error,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  enableRowSelection = false,
  enableColumnVisibility = true,
  enableExport = true,
  onRowClick,
  selectedRowIds,
  onSelectedRowIdsChange,
  manualPagination,
  pageCount,
  onPageChange,
  sx,
  toolbarActions,
  emptyTitle,
  emptyDescription,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnMenuAnchor, setColumnMenuAnchor] = useState(null);
  const [rowSelection, setRowSelection] = useState({});

  const finalColumns = useMemo(() => {
    if (!enableRowSelection) return columns;
    return [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            size="small"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
            size="small"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        size: 48,
        enableSorting: false,
      },
      ...columns,
    ];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data: data || [],
    columns: finalColumns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    manualPagination: manualPagination || false,
    pageCount: manualPagination ? pageCount : undefined,
    enableRowSelection: enableRowSelection,
  });

  const handleExportCSV = useCallback(() => {
    const exportData = data.map((row) => {
      const obj = {};
      columns.forEach((col) => {
        if (col.accessorKey) {
          obj[col.header || col.accessorKey] = col.accessorFn ? col.accessorFn(row) : row[col.accessorKey];
        }
      });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buf], { type: 'application/octet-stream' });
    saveAs(blob, `export-${Date.now()}.xlsx`);
  }, [data, columns]);

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', ...sx }}>
      {(enableColumnVisibility || enableExport || toolbarActions) && (
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            minHeight: 48,
            px: 2,
          }}
        >
          {toolbarActions}
          {enableExport && data?.length > 0 && (
            <IconButton size="small" onClick={handleExportCSV} title="Export to Excel">
              <FileDownloadIcon />
            </IconButton>
          )}
          {enableColumnVisibility && (
            <>
              <IconButton size="small" onClick={(e) => setColumnMenuAnchor(e.currentTarget)} title="Toggle columns">
                <ViewColumnIcon />
              </IconButton>
              <Menu
                anchorEl={columnMenuAnchor}
                open={Boolean(columnMenuAnchor)}
                onClose={() => setColumnMenuAnchor(null)}
              >
                {table.getAllLeafColumns().map((column) => {
                  if (column.id === 'select') return null;
                  return (
                    <MenuItem key={column.id} onClick={() => column.toggleVisibility()}>
                      <ListItemIcon>
                        <Checkbox checked={column.getIsVisible()} size="small" />
                      </ListItemIcon>
                      <ListItemText primary={typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id} />
                    </MenuItem>
                  );
                })}
              </Menu>
            </>
          )}
        </Toolbar>
      )}
      <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sortDirection={header.column.getIsSorted()}
                    sx={{
                      fontWeight: 600,
                      bgcolor: 'background.paper',
                      whiteSpace: 'nowrap',
                      minWidth: header.getSize(),
                    }}
                  >
                    {header.column.getCanSort() ? (
                      <TableSortLabel
                        active={!!header.column.getIsSorted()}
                        direction={header.column.getIsSorted() || 'asc'}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableSortLabel>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {finalColumns.map((col, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" width={col.size || 100} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  selected={row.getIsSelected()}
                  onClick={() => onRowClick?.(row.original)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={finalColumns.length} sx={{ border: 'none' }}>
                  <EmptyState
                    title={emptyTitle || 'No data found'}
                    description={emptyDescription || 'No records to display.'}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={manualPagination ? (pageCount || 0) : data?.length || 0}
        page={table.getState().pagination.page}
        onPageChange={(_, page) => {
          table.setPageIndex(page);
          onPageChange?.(page + 1);
        }}
        rowsPerPage={pageSize}
        rowsPerPageOptions={pageSizeOptions}
        onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}
      />
    </Paper>
  );
}
