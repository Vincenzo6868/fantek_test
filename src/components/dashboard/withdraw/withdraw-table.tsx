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

// import { useGetKYCList } from '@/hooks/use-kyc';
import Notification from '@/components/notification/notification';
import WithdrawDialog from './withdraw-popup';

export interface WithdrawItem {
  transactionId: string;
  userId: string;
  amount: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  fee: string;
  image: string;
}

export interface WithdrawResponse {
  data: WithdrawItem[];
  page: number;
  limit: number;
  total: number;
  success: boolean;
}

export function WithdrawTable(): React.JSX.Element {
  // const { kycItems, loading, page, limit, total, setPage, setLimit } = useGetKYCList();

  // dummy data
  const withdrawItems: WithdrawItem[] = [
    {
      transactionId: 'txn_123456',
      userId: 'user_123',
      amount: '1.000$',
      status: 'pending',
      createdAt: '2023-10-01T12:00:00Z',
      updatedAt: '2023-10-01T12:00:00Z',
      fee: '10%',
      image: '',
    },
    {
      transactionId: 'txn_789012',
      userId: 'user_456',
      amount: '5.000.000$',
      status: 'approved',
      createdAt: '2023-10-02T12:00:00Z',
      updatedAt: '2023-10-02T12:00:00Z',
      fee: '5%',
      image: 'https://thuvienvector.vn/wp-content/uploads/2025/03/anh-chuyen-khoan-thanh-cong-Techcombank-01.jpg',
    },
    {
      transactionId: 'txn_789999',
      userId: 'user_999',
      amount: '10.000.000$',
      status: 'rejected',
      createdAt: '2023-10-02T12:00:00Z',
      updatedAt: '2023-10-02T12:00:00Z',
      fee: '5%',
      image: '',
    },
  ];
  const page = 1; // current page
  const limit = 10; // items per page
  const loading = false; // loading state
  const total = withdrawItems.length; // total items

  const [statuses, setStatuses] = React.useState<Record<string, 'approved' | 'rejected' | 'pending'>>({});
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
      approved: { label: 'Đã Thanh Toán', color: 'green' },
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
                <TableCell>Mã Giao Dịch</TableCell>
                <TableCell>ID Người Dùng</TableCell>
                <TableCell>Số Tiền</TableCell>
                <TableCell>Phí</TableCell>
                <TableCell>Trạng Thái</TableCell>
                <TableCell>Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedWithdraws.map((row) => {
                const status = statuses[row.transactionId] ? statuses[row.transactionId] : row.status;

                return (
                  <TableRow hover key={row.transactionId}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="subtitle2">{row.transactionId}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.userId}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                    <TableCell>{row.fee}</TableCell>
                    <TableCell>{renderStatus(status)}</TableCell>
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
              })}
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
          onPageChange={(): void => {
            // setPage(newPage + 1);
          }}
          onRowsPerPageChange={(): void => {
            // setLimit(parseInt(e.target.value, 10));
            // setPage(1);
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
