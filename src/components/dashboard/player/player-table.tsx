'use client';

// PlayerTable.tsx
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

import { useGetPlayer, useUpdatePlayerStatus } from '@/hooks/use-player';
import type { Player } from '@/hooks/use-player';
import Notification from '@/components/notification/notification';

import { NoData } from './no-data';

export function PlayerTable(): React.JSX.Element {
  // Fetch player data
  const { players, loading, page, limit, total, setPage, setLimit } = useGetPlayer();

  // update player status
  const { updateStatus, loading: updateLoading } = useUpdatePlayerStatus();
  const paginatedPlayers = applyPagination(players, page, limit);
  const rows = paginatedPlayers;

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

  // handle change player status
  const handleAction = async (userId: string, action: 'accepted' | 'rejected' | 'pending') => {
    try {
      await updateStatus(userId, action);

      setStatuses((prev) => ({
        ...prev,
        [userId]: action,
      }));

      const message =
        action === 'accepted'
          ? 'Cầu thủ đã được chấp nhận.'
          : action === 'rejected'
            ? 'Cầu thủ đã bị từ chối.'
            : 'Cầu thủ trở về trạng thái chờ.';

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
                <TableCell>Tên Cầu Thủ</TableCell>
                <TableCell>Câu Lạc Bộ</TableCell>
                <TableCell>Số Điện Thoại</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mật Khẩu</TableCell>
                <TableCell>Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows?.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0, border: 'none' }}>
                    <NoData
                      title="Không có cầu thủ"
                      description="Hiện tại không có cầu thủ nào để hiển thị. Các cầu thủ mới sẽ xuất hiện tại đây."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                rows?.map((row) => {
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
              })
              )}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          rowsPerPage={limit}
          rowsPerPageOptions={[10, 20, 50, 100]}
          onPageChange={(_, newPage): void => {
            setPage(newPage + 1);
          }}
          onRowsPerPageChange={(e): void => {
            setLimit(parseInt(e.target.value, 10));
            setPage(1);
          }}
        />
      </Card>
    </>
  );
}

function applyPagination(rows: Player[], page: number, limit: number): Player[] {
  return rows.slice((page - 1) * limit, page * limit);
}
