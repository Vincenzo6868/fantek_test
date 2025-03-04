'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

export interface Club {
  id: string;
  club_name: string;
  representative_name: string;
  phone: string;
  email: string;
  password: string;
}

interface ClubsTableProps {
  count?: number;
  page?: number;
  rows?: Club[];
  rowsPerPage?: number;
}

export function ClubTable({ count = 0, rows = [], page = 0, rowsPerPage = 0 }: ClubsTableProps): React.JSX.Element {
  const [statuses, setStatuses] = React.useState<Record<string, 'accepted' | 'rejected' | 'pending'>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [notification, setNotification] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleAction = (id: string, action: 'accepted' | 'rejected' | 'pending') => {
    setIsLoading(true);

    setTimeout(() => {
      setStatuses((prev) => ({
        ...prev,
        [id]: action,
      }));

      setIsLoading(false);

      let message = `Câu lạc bộ đã ${action === 'accepted' ? 'được chấp nhận' : action === 'rejected' ? 'bị từ chối' : 'trở về trạng thái chờ'}.`;
      let severity: 'success' | 'error' | 'info' =
        action === 'accepted' ? 'success' : action === 'rejected' ? 'error' : 'info';

      setNotification({ open: true, message, severity });
    }, 1000);
  };

  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => {
          setNotification({ ...notification, open: false });
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => {
            setNotification({ ...notification, open: false });
          }}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell>Tên Câu Lạc Bộ</TableCell>
                <TableCell>Tên Người Đại Diện</TableCell>
                <TableCell>Số Điện Thoại</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mật Khẩu</TableCell>
                <TableCell>Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const status = statuses[row.id] || 'pending';
                const isDisabled = status !== 'pending';
                return (
                  <TableRow hover key={row.id}>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        <Typography variant="subtitle2">{row.club_name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.representative_name}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{status === 'accepted' ? row.password : '******'}</TableCell>
                    <TableCell>
                      <Select
                        value={status}
                        onChange={(event) => {
                          handleAction(row.id, event.target.value as 'accepted' | 'rejected' | 'pending');
                        }}
                        size="small"
                        sx={{ minWidth: 130 }}
                        disabled={isDisabled || isLoading}
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
          onPageChange={() => {
            // TODO: Implement pagination logic
          }}
          onRowsPerPageChange={() => {
            // TODO: Handle rows per page change
          }}
        />
      </Card>
    </>
  );
}