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

import { useUpdateKYCStatus } from '@/hooks/use-kyc';

import type { KYCItem } from './kyc-table';

interface KYCDialogProps {
  open: boolean;
  onClose: () => void;
  kyc: KYCItem | null;
  setNotification: (notification: { open: boolean; message: string; severity: 'success' | 'error' | 'info' }) => void;
  renderStatus: (status: KYCItem['status']) => React.ReactNode;
  setStatuses: React.Dispatch<React.SetStateAction<Record<string, 'approved' | 'rejected' | 'pending'>>>;
  statuses: Record<string, 'approved' | 'rejected' | 'pending'>;
}

export default function KYCDialog({
  open,
  onClose,
  kyc,
  setNotification,
  renderStatus,
  setStatuses,
  statuses
}: KYCDialogProps): React.JSX.Element {
  const {updateStatus, loading} = useUpdateKYCStatus();

  // handle change kyc status
  const handleAction = async (id: string, action: 'approved' | 'rejected' | 'pending') => {
    try {
      await updateStatus(id, action);

      setStatuses((prev) => ({
        ...prev,
        [id]: action,
      }));

      const message =
        action === 'approved'
          ? 'Tài khoản đã được chấp nhận.'
          : action === 'rejected'
            ? 'Tài khoản đã bị từ chối.'
            : 'Tài khoản trở về trạng thái chờ.';

      const severity: 'success' | 'error' | 'info' =
        action === 'approved' ? 'success' : action === 'rejected' ? 'error' : 'info';

      setNotification({ open: true, message, severity });

      // close dialog
      onClose();

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

  const status = statuses[kyc?._id || ''] || kyc?.status;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
        Thông tin KYC: {kyc?.docInfo?.name}
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
                  <InfoRow label="ID" value={kyc._id} />
                  <InfoRow label="Loại giấy tờ" value={kyc.type} style={{ textTransform: 'uppercase' }} />
                  <InfoRow label="Tên" value={kyc.docInfo.name} />
                  <InfoRow label="Ngày sinh" value={kyc.docInfo.dob} />
                  <InfoRow label="Số" value={kyc.docInfo.idNo} />
                  <InfoRow label="Ngày cấp" value={kyc.docInfo.issue} />
                  <InfoRow label="Ngày hết hạn" value={kyc.docInfo.expiry} />
                  <InfoRow label="Trạng thái" value={renderStatus(status)} />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <ImageBox title="Ảnh mặt trước" src={kyc.image.front} />
                  <ImageBox title="Ảnh mặt sau" src={kyc.image.back} />
                </Box>
              </Grid>
            </Grid>

            {status === 'pending' && (
              <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                <ActionButton
                  label="Từ Chối"
                  color="error"
                  onClick={() => {
                    void handleAction(
                      kyc._id,
                      'rejected'
                    );
                  }}
                />
                <ActionButton
                  label="Phê Duyệt"
                  color="primary"
                  onClick={() => {
                    void handleAction(
                      kyc._id,
                      'approved'
                    );
                  }}
                />
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

function InfoRow({
  label,
  value,
  style,
}: {
  label: string;
  value: React.ReactNode;
  style?: React.CSSProperties;
}): React.JSX.Element {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 500, ...(style || {}) }}>
        {value}
      </Typography>
      <Divider sx={{ my: 1 }} />
    </Box>
  );
}

function ImageBox({ title, src }: { title: string; src: string }): React.JSX.Element {
  const [loaded, setLoaded] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };
  
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>

      <Box
        onClick={handleOpen}
        sx={{
          width: '100%',
          height: 240,
          borderRadius: 2,
          border: '1px solid #ccc',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#f0f0f0',
          cursor: 'pointer',
        }}
      >
        <Box
          component="img"
          src={src}
          alt={title}
          onLoad={() => {setLoaded(true)}}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
          }}
        />
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="md">
        <Box
          component="img"
          src={src}
          alt={title}
          sx={{
            width: '100%',
            height: 'auto',
            maxHeight: '90vh',
            objectFit: 'contain',
          }}
        />
      </Dialog>
    </Box>
  );
}
