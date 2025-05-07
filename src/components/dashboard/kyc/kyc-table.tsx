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

import { useGetKYCList } from '@/hooks/use-kyc';
import Notification from '@/components/notification/notification';
import KYCDialog from './kyc-popup';

export interface DocInfo {
  name: string;
  dob: string;
  idNo: string;
  issue: string;
  expiry: string;
}

export interface Image {
  front: string;
  back: string;
}

export interface KYCItem {
  _id: string;
  user: string;
  type: string;
  docInfo: DocInfo;
  s3Keys: string[];
  status: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
  image: Image;
}

export interface KYCResponse {
  data: KYCItem[];
  page: number;
  limit: number;
  total: number;
  success: boolean;
}

export function KYCTable(): React.JSX.Element {
  const { kycItems, loading, page, limit, total, setPage, setLimit } = useGetKYCList();

  const [statuses, setStatuses] = React.useState<Record<string, 'approved' | 'rejected' | 'pending'>>({});
  const paginatedKYCs = applyPagination(kycItems, page, limit);

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
  const [selectedKYC, setSelectedKYC] = React.useState<KYCItem | null>(null);

  function renderStatus(status: KYCItem['status']): React.ReactNode {
    const statusMap: Record<KYCItem['status'], { label: string; color: string }> = {
      approved: { label: 'Đã Duyệt', color: 'green' },
      pending: { label: 'Chờ Duyệt', color: 'orange' },
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
                <TableCell>Tên</TableCell>
                <TableCell>Ngày Sinh</TableCell>
                <TableCell>Loại Giấy Tờ</TableCell>
                <TableCell>Trạng Thái</TableCell>
                <TableCell>Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedKYCs.map((row, index) => {
                const status = statuses[row._id] ? statuses[row._id] : row.status;

                return (
                  <TableRow hover key={row._id}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="subtitle2">{row.docInfo.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.docInfo.dob}</TableCell>
                    <TableCell sx={{ textTransform: 'uppercase' }}>{row.type}</TableCell>
                    <TableCell>{renderStatus(status)}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedKYC(row);
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
          onPageChange={(_, newPage): void => {
            setPage(newPage + 1);
          }}
          onRowsPerPageChange={(e): void => {
            setLimit(parseInt(e.target.value, 10));
            setPage(1);
          }}
        />
      </Card>

      <KYCDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        kyc={selectedKYC}
        setNotification={setNotification}
        renderStatus={renderStatus}
        setStatuses={setStatuses}
        statuses={statuses}
      />
    </>
  );
}

function applyPagination(rows: KYCItem[], page: number, limit: number): KYCItem[] {
  return rows.slice((page - 1) * limit, page * limit);
}
