'use client';

import * as React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';

import type { KYC } from './kyc-table';

interface KYCDialogProps {
  open: boolean;
  onClose: () => void;
  kyc: KYC | null;
  setNotification: (notification: { open: boolean; message: string; severity: 'success' | 'error' | 'info' }) => void;
  renderStatus: (status: KYC['status']) => React.ReactNode;
  setKycList: React.Dispatch<React.SetStateAction<KYC[]>>;
}

export default function KYCDialog({
  open,
  onClose,
  kyc,
  setNotification,
  renderStatus,
  setKycList,
}: KYCDialogProps): React.JSX.Element {
  const [loading, setLoading] = React.useState(false);

  const handleAction = (newStatus: KYC['status']): void => {
    if (!kyc) return;

    setLoading(true);

    const updateKYCStatus = new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });

    updateKYCStatus
      .then(() => {
        setKycList((prev) =>
          prev.map((item) => (item.userId === kyc.userId ? { ...item, status: newStatus } : item))
        );

        const message =
          newStatus === 'approved' ? 'Hồ sơ KYC đã được phê duyệt.' : 'Hồ sơ KYC đã bị từ chối.';

        setNotification({
          open: true,
          message,
          severity: newStatus === 'approved' ? 'success' : 'error',
        });
      })
      .catch((error: unknown) => {
        const err = error as Error;
        setNotification({
          open: true,
          message: `Có lỗi xảy ra khi cập nhật trạng thái KYC: ${err.message}`,
          severity: 'error',
        });
      })
      .finally(() => {
        setLoading(false);
        onClose();
      });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
        Thông tin KYC: {kyc?.name}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {kyc ? (
          <>
            <Grid container spacing={6}>
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <InfoRow label="ID" value={kyc.userId} />
                  <InfoRow label="Tên" value={kyc.name} />
                  <InfoRow label="Ngày sinh" value={kyc.dateOfBirth} />
                  <InfoRow label="Số CMND/CCCD" value={kyc.idNumber} />
                  <InfoRow label="Ngày cấp" value={kyc.issueDate} />
                  <InfoRow label="Loại giấy tờ" value={kyc.cardType} />
                  <InfoRow label="Trạng thái" value={renderStatus(kyc.status)} />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <ImageBox title="Ảnh mặt trước" src={kyc.frontImageUrl} />
                  <ImageBox title="Ảnh mặt sau" src={kyc.backImageUrl} />
                </Box>
              </Grid>
            </Grid>

            {kyc.status === 'pending' && (
              <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                <ActionButton label="Từ Chối" color="error" onClick={() => { handleAction('rejected'); }} />
                <ActionButton label="Phê Duyệt" color="primary" onClick={() => { handleAction('approved'); }} />
              </Box>
            )}
          </>
        ) : null}
      </DialogContent>

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Dialog>
  );
}

function ActionButton({
  label,
  color,
  onClick,
}: {
  label: string;
  color: 'primary' | 'error';
  onClick: () => void;
}): React.JSX.Element {
  return (
    <Button variant="contained" color={color} onClick={onClick} sx={{ minWidth: 150, fontWeight: 700 }}>
      {label}
    </Button>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }): React.JSX.Element {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
      <Divider sx={{ my: 1 }} />
    </Box>
  );
}

function ImageBox({ title, src }: { title: string; src: string }): React.JSX.Element {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Box
        component="img"
        src={src}
        alt={title}
        sx={{
          width: '100%',
          height: 'auto',
          borderRadius: 2,
          border: '1px solid #ccc',
        }}
      />
    </Box>
  );
}
