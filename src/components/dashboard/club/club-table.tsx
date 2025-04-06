'use client';

// ClubTable.tsx
import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
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

import { useGetClub, useUpdateClubStatus } from '@/hooks/use-club';
import Notification from '@/components/notification/notification';

export interface Club {
  userId: string;
  displayName: string;
  representativeName: string;
  phoneNumber: string;
  email: string;
  onboarded: boolean;
  onboardStatus: string;
  password: string;
}

export function ClubTable(): React.JSX.Element {
  // Fetch club data
  const { clubs, loading } = useGetClub();

  // pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // update club status
  const { updateStatus, loading: updateLoading } = useUpdateClubStatus();
  const paginatedClubs = applyPagination(clubs, page, rowsPerPage);
  const rows = paginatedClubs;
  const count = clubs.length;

  const [statuses, setStatuses] = React.useState<Record<string, 'accepted' | 'rejected' | 'pending'>>({});
  const [notification, setNotification] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // handle change club status
  const handleAction = async (userId: string, action: 'accepted' | 'rejected' | 'pending') => {
    try {
      await updateStatus(userId, action);

      setStatuses((prev) => ({
        ...prev,
        [userId]: action,
      }));

      const message =
        action === 'accepted'
          ? 'Câu lạc bộ đã được chấp nhận.'
          : action === 'rejected'
            ? 'Câu lạc bộ đã bị từ chối.'
            : 'Câu lạc bộ trở về trạng thái chờ.';

      const severity: 'success' | 'error' | 'info' =
        action === 'accepted' ? 'success' : action === 'rejected' ? 'error' : 'info';

      setNotification({ open: true, message, severity });
    } catch (err: unknown) {
      let errorMessage = 'Có lỗi xảy ra khi cập nhật trạng thái.';

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={updateLoading || loading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Use Notification component */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => {
          setNotification({ ...notification, open: false });
        }}
      />

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
                const status = statuses[row.userId] ?? row.onboardStatus;
                const isDisabled = row.onboardStatus !== 'pending' || status !== 'pending';
                return (
                  <TableRow hover key={row.userId}>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        <Typography variant="subtitle2">{row.displayName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.representativeName}</TableCell>
                    <TableCell>{row.phoneNumber}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{status === 'accepted' ? row.password : '******'}</TableCell>
                    <TableCell>
                      <Select
                        value={status}
                        renderValue={() => {
                          if (row.onboardStatus === 'accepted' || status === 'accepted') {
                            return 'Đã chấp nhận';
                          } else if (row.onboardStatus === 'rejected' || status === 'rejected') {
                            return 'Từ chối';
                          }
                          return 'Chờ xử lý';
                        }}
                        onChange={(event) => {
                          void handleAction(row.userId, event.target.value as 'accepted' | 'rejected' | 'pending');
                        }}
                        size="small"
                        sx={{ minWidth: 150 }}
                        disabled={isDisabled || updateLoading}
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
          rowsPerPageOptions={[10, 20, 50, 100]}
          onPageChange={(_, newPage) => {
            setPage(newPage);
          }}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0); // reset lại page khi thay đổi số dòng mỗi trang
          }}
        />
      </Card>
    </>
  );
}

function applyPagination(rows: Club[], page: number, rowsPerPage: number): Club[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
