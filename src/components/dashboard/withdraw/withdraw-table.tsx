'use client';

import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useGetWithdrawList } from '@/hooks/use-withdraw';
import Notification from '@/components/notification/notification';

import { NoData } from './no-data';
import WithdrawDialog from './withdraw-popup';

export interface WithdrawItem {
  _id: string;
  user: {
    _id: string;
    email: string;
    displayName: string;
  };
  withdrawId: string;
  bankId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  note: string;
  image: string;
  status: 'pending' | 'transferred' | 'rejected';
  txnHash: string;
  createdAt: number;
  updatedAt: number;
  __v: number;
}

export interface WithdrawResponse {
  data: WithdrawItem[];
  page: number;
  limit: number;
  total: number;
  success: boolean;
}

export function WithdrawTable(): React.JSX.Element {
  const { withdrawItems, loading, page, limit, total, setPage, setLimit } = useGetWithdrawList();

  const [statuses, setStatuses] = React.useState<Record<string, 'transferred' | 'rejected' | 'pending'>>({});
  const paginatedWithdraws = applyPagination(withdrawItems, page, limit);

  const [notification, setNotification] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [selectedWithdraw, setSelectedWithdraw] = React.useState<WithdrawItem | null>(null);

  function renderStatus(status: WithdrawItem['status']): React.ReactNode {
    const statusMap: Record<WithdrawItem['status'], { label: string; color: string }> = {
      transferred: { label: 'Đã Chuyển Khoản', color: 'green' },
      pending: { label: 'Chờ Thanh Toán', color: 'orange' },
      rejected: { label: 'Đã Từ Chối', color: 'red' },
    };

    const { label, color } = statusMap[status];

    return <span style={{ color, fontWeight: 600, textTransform: 'capitalize' }}>{label}</span>;
  }

  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => {
          setNotification((prev) => ({ ...prev, open: false }));
        }}
      />

      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>Mã Rút Tiền</TableCell>
                <TableCell>Người Dùng</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Số Tiền</TableCell>
                <TableCell>Trạng Thái</TableCell>
                <TableCell>Ngày Tạo</TableCell>
                <TableCell>Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedWithdraws.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ p: 0, border: 'none' }}>
                    <NoData
                      title="Không có yêu cầu rút tiền"
                      description="Hiện tại không có yêu cầu rút tiền nào để hiển thị. Các yêu cầu mới sẽ xuất hiện tại đây."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedWithdraws.map((row) => {
                  const status = statuses[row._id] ? statuses[row._id] : row.status;

                  return (
                    <TableRow hover key={row._id}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="subtitle2">{row.withdrawId}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{row.user.displayName}</TableCell>
                      <TableCell>{row.user.email}</TableCell>
                      <TableCell>{row.amount.toLocaleString('vi-VN')} VND</TableCell>
                      <TableCell>{renderStatus(status)}</TableCell>
                      <TableCell>{new Date(row.createdAt * 1000).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWithdraw(row);
                            setDialogOpen(true);
                          }}
                          style={{
                            color: '#1976d2',
                            cursor: 'pointer',
                            background: 'none',
                            border: 'none',
                            fontWeight: 600,
                          }}
                        >
                          Chỉnh Sửa
                        </button>
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

      <WithdrawDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        withdraw={selectedWithdraw}
        setNotification={setNotification}
        renderStatus={renderStatus}
        setStatuses={setStatuses}
        statuses={statuses}
      />
    </>
  );
}

function applyPagination(rows: WithdrawItem[], page: number, limit: number): WithdrawItem[] {
  return rows.slice((page - 1) * limit, page * limit);
}
