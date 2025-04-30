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

import Notification from '@/components/notification/notification';
import KYCDialog from './kyc-popup';

type KYCStatus = 'approved' | 'pending' | 'rejected';

export interface KYC {
  userId: string;
  name: string;
  dateOfBirth: string;
  idNumber: string;
  issueDate: string;
  cardType: string;
  frontImageUrl: string;
  backImageUrl: string;
  status: KYCStatus;
}

export function KYCTable(): React.JSX.Element {
  // dummy data
  const initialData: KYC[] = [
    {
      userId: 'KYC123456',
      name: 'Nguyễn Văn A',
      dateOfBirth: '1990-05-12',
      idNumber: '123456789',
      issueDate: '2015-08-01',
      cardType: 'CMND',
      frontImageUrl: 'https://placehold.co/600x400',
      backImageUrl: 'https://placehold.co/600x400',
      status: 'approved',
    },
    {
      userId: 'KYC789012',
      name: 'Trần Thị B',
      dateOfBirth: '1992-11-23',
      idNumber: '987654321',
      issueDate: '2018-04-17',
      cardType: 'CCCD',
      frontImageUrl: 'https://placehold.co/600x400',
      backImageUrl: 'https://placehold.co/600x400',
      status: 'pending',
    },
    {
      userId: 'KYC345678',
      name: 'Lê Văn C',
      dateOfBirth: '1985-02-28',
      idNumber: '456789123',
      issueDate: '2012-12-12',
      cardType: 'Passport',
      frontImageUrl: 'https://placehold.co/600x400',
      backImageUrl: 'https://placehold.co/600x400',
      status: 'rejected',
    },
    {
      userId: 'KYC901234',
      name: 'Phạm Thị D',
      dateOfBirth: '1988-07-14',
      idNumber: '111222333',
      issueDate: '2016-03-22',
      cardType: 'CCCD',
      frontImageUrl: 'https://placehold.co/600x400',
      backImageUrl: 'https://placehold.co/600x400',
      status: 'pending',
    },
    {
      userId: 'KYC567890',
      name: 'Đặng Văn E',
      dateOfBirth: '1995-01-30',
      idNumber: '999888777',
      issueDate: '2019-05-10',
      cardType: 'CMND',
      frontImageUrl: 'https://placehold.co/600x400',
      backImageUrl: 'https://placehold.co/600x400',
      status: 'pending',
    },
    {
      userId: 'KYC112233',
      name: 'Ngô Thị F',
      dateOfBirth: '1991-09-20',
      idNumber: '444555666',
      issueDate: '2014-09-05',
      cardType: 'Passport',
      frontImageUrl: 'https://placehold.co/600x400',
      backImageUrl: 'https://placehold.co/600x400',
      status: 'pending',
    },
    {
      userId: 'KYC445566',
      name: 'Lý Văn G',
      dateOfBirth: '1983-06-18',
      idNumber: '777666555',
      issueDate: '2013-11-25',
      cardType: 'CCCD',
      frontImageUrl: 'https://placehold.co/600x400',
      backImageUrl: 'https://placehold.co/600x400',
      status: 'pending',
    },
    {
      userId: 'KYC778899',
      name: 'Trịnh Thị H',
      dateOfBirth: '1996-02-11',
      idNumber: '888999000',
      issueDate: '2020-01-15',
      cardType: 'CMND',
      frontImageUrl: 'https://placehold.co/600x400',
      backImageUrl: 'https://placehold.co/600x400',
      status: 'pending',
    },
    {
      userId: 'KYC334455',
      name: 'Bùi Văn I',
      dateOfBirth: '1980-03-03',
      idNumber: '321654987',
      issueDate: '2010-07-20',
      cardType: 'Passport',
      frontImageUrl: 'https://placehold.co/600x400',
      backImageUrl: 'https://placehold.co/600x400',
      status: 'rejected',
    },
    {
      userId: 'KYC667788',
      name: 'Vũ Thị J',
      dateOfBirth: '1993-12-25',
      idNumber: '654321987',
      issueDate: '2017-06-18',
      cardType: 'CCCD',
      frontImageUrl: 'https://placehold.co/600x400',
      backImageUrl: 'https://placehold.co/600x400',
      status: 'approved',
    },
  ];
  
  const [kycList, setKycList] = React.useState<KYC[]>(initialData);

  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
  const paginatedKYCs = applyPagination(kycList, page, rowsPerPage);

  const [loading, setLoading] = React.useState<boolean>(true);
  React.useEffect((): (() => void) => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
  
    return (): void => {
      clearTimeout(timer);
    };
  }, []);
  
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
  const [selectedKYC, setSelectedKYC] = React.useState<KYC | null>(null);

  function renderStatus(status: KYC['status']): React.ReactNode {
    const statusMap: Record<KYC['status'], { label: string; color: string }> = {
      approved: { label: 'Đã Duyệt', color: 'green' },
      pending: { label: 'Chờ Duyệt', color: 'orange' },
      rejected: { label: 'Đã Từ Chối', color: 'red' },
    };

    const { label, color } = statusMap[status];

    return (
      <span style={{ color, fontWeight: 600, textTransform: 'capitalize' }}>
        {label}
      </span>
    );
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
                <TableCell>ID</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Ngày Sinh</TableCell>
                <TableCell>Trạng Thái</TableCell>
                <TableCell>Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedKYCs.map((row, index) => (
                <TableRow hover key={row.userId}>
                  <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="subtitle2">{row.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.dateOfBirth}</TableCell>
                  <TableCell>{renderStatus(row.status)}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={kycList.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 20, 50, 100]}
          onPageChange={(_, newPage): void => {
            setPage(newPage);
          }}
          onRowsPerPageChange={(e): void => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
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
        setKycList={setKycList}
      />
    </>
  );
}

function applyPagination(rows: KYC[], page: number, rowsPerPage: number): KYC[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
