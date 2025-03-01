'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useSelection } from '@/hooks/use-selection';

export interface Club {
  id: string;
  club_name: string;
  representative_name: string;
  phone: string;
  email: string;
}

interface ClubsTableProps {
  count?: number;
  page?: number;
  rows?: Club[];
  rowsPerPage?: number;
}

export function ClubTable({ count = 0, rows = [], page = 0, rowsPerPage = 0 }: ClubsTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => rows.map((club) => club.id), [rows]);
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = selected?.size > 0 && selected?.size < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const [statuses, setStatuses] = React.useState<Record<string, 'accepted' | 'rejected' | 'pending'>>({});

  const handleAction = (id: string, action: 'accepted' | 'rejected' | 'pending') => {
    setStatuses((prev) => ({
      ...prev,
      [id]: action,
    }));
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => (event.target.checked ? selectAll() : deselectAll())}
                />
              </TableCell>
              <TableCell>Tên Câu Lạc Bộ</TableCell>
              <TableCell>Tên người đại diện</TableCell>
              <TableCell>Số Điện Thoại</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected?.has(row.id);
              const status = statuses[row.id] || 'pending';

              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => (event.target.checked ? selectOne(row.id) : deselectOne(row.id))}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Typography variant="subtitle2">{row.club_name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.representative_name}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    <Select
                      value={status}
                      onChange={(event) =>
                        handleAction(row.id, event.target.value as 'accepted' | 'rejected' | 'pending')
                      }
                      size="small"
                      sx={{ minWidth: 130 }}
                    >
                      <MenuItem value="pending">Chờ xử lý</MenuItem>
                      <MenuItem value="accepted">Chấp nhận</MenuItem>
                      <MenuItem value="rejected">Từ chối</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
      />
    </Card>
  );
}
