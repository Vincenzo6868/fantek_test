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

// import { useUpdateKYCStatus } from '@/hooks/use-kyc';

import type { WithdrawItem } from './withdraw-table';

interface WithdrawDialogProps {
  open: boolean;
  onClose: () => void;
  withdraw: WithdrawItem | null;
  setNotification: (notification: { open: boolean; message: string; severity: 'success' | 'error' | 'info' }) => void;
  renderStatus: (status: WithdrawItem['status']) => React.ReactNode;
  setStatuses: React.Dispatch<React.SetStateAction<Record<string, 'approved' | 'rejected' | 'pending'>>>;
  statuses: Record<string, 'approved' | 'rejected' | 'pending'>;
}

export default function WithdrawDialog({
  open,
  onClose,
  withdraw,
  setNotification,
  renderStatus,
  setStatuses,
  statuses,
}: WithdrawDialogProps): React.JSX.Element {
  // const {updateStatus, loading} = useUpdateKYCStatus();

  // state to manage upload images
  const [uploadedImages, setUploadedImages] = React.useState<Record<string, string>>({});
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // if withdraw is null, return empty dialog
  if (!withdraw) return <></>;

  const transactionId = withdraw.transactionId;
  const uploadedImage = uploadedImages[transactionId];

  // handle change withdraw status
  const handleUpdateStatus = async (id: string, action: 'approved' | 'rejected') => {
    try {
      // await updateStatus(id, action);

      setStatuses((prev) => ({
        ...prev,
        [id]: action,
      }));

      const message =
        action === 'approved'
          ? 'Yêu cầu đã được thanh toán.'
          : action === 'rejected'
            ? 'Yêu cầu bị từ chối.'
            : 'Yêu cầu trở về trạng thái chờ.';

      const severity: 'success' | 'error' | 'info' =
        action === 'approved' ? 'success' : action === 'rejected' ? 'error' : 'info';

      setNotification({ open: true, message, severity });

      // close dialog
      onClose();
    } catch (err: unknown) {
      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.';

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

  const status = statuses[transactionId || ''] || withdraw?.status;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
        Yêu Cầu Rút Tiền: #{transactionId}
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
        {withdraw ? (
          <>
            <Grid container spacing={6}>
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <InfoRow label="Mã Giao Dịch" value={transactionId} />
                  <InfoRow label="ID Người Dùng" value={withdraw.userId} />
                  <InfoRow label="Số Tiền" value={withdraw.amount} />
                  <InfoRow label="Phí" value={withdraw.fee} />
                  <InfoRow label="Trạng thái" value={renderStatus(status)} />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Typography variant="body2" color="text.secondary" fontWeight={700}>
                    ẢNH CHUYỂN KHOẢN<span style={{ color: '#f44336' }}>*</span>
                  </Typography>
                  {status === 'pending' && (
                    <Box
                      id="upload-image-box"
                      onClick={() => {
                        if (inputRef.current) {
                          inputRef.current.click();
                        }
                      }}
                      sx={{
                        width: '100%',
                        height: 240,
                        borderRadius: 2,
                        border: '1px dashed #aaa',
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: '#f9f9f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#f0f0f0',
                        },
                      }}
                    >
                      {uploadedImage ? (
                        <>
                          <Box
                            component="img"
                            src={uploadedImage}
                            alt="Uploaded"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              zIndex: 1,
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();

                              setUploadedImages((prev) => {
                                const { [transactionId]: _, ...rest } = prev;
                                return rest;
                              });
                              
                              if (inputRef.current) inputRef.current.value = '';
                            }}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 2,
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.7)',
                              },
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <Typography color="text.secondary" sx={{ zIndex: 1 }}>
                          Nhấn để tải ảnh lên
                        </Typography>
                      )}
                    </Box>
                  )}
                  {(status === 'approved' || status === 'rejected') && (
                    <WithdrawImage withdraw={withdraw} uploadedImage={uploadedImage} />
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={inputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setUploadedImages((prev) => ({
                            ...prev,
                            [transactionId]: reader.result as string,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </Box>
              </Grid>
            </Grid>

            {status === 'pending' && (
              <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                <ActionButton
                  label="Từ Chối"
                  color="error"
                  onClick={() => {
                    void handleUpdateStatus(transactionId, 'rejected');
                  }}
                />
                <ActionButton
                  label="Thanh Toán"
                  disabled={!uploadedImage}
                  color="primary"
                  onClick={() => {
                    void handleUpdateStatus(transactionId, 'approved');
                  }}
                />
              </Box>
            )}
          </>
        ) : null}
      </DialogContent>

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={false}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Dialog>
  );
}

function ActionButton({
  label,
  color,
  onClick,
  disabled = false,
}: {
  label: string;
  color: 'primary' | 'error';
  onClick: () => void;
  disabled?: boolean;
}): React.JSX.Element {
  return (
    <Button
      variant="contained"
      color={color}
      onClick={onClick}
      disabled={disabled}
      sx={{ minWidth: 150, fontWeight: 700 }}
    >
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

function WithdrawImage({ withdraw, uploadedImage }: { withdraw: WithdrawItem; uploadedImage?: string }) {
  const [open, setOpen] = React.useState(false);
  const imageSrc = withdraw.image || uploadedImage;

  const handleOpen = (): void => {
    if (imageSrc) setOpen(true);
  };
  const handleClose = (): void => {
    setOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          width: '100%',
          height: 240,
          borderRadius: 2,
          border: '1px dashed #aaa',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#f9f9f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: imageSrc ? 'pointer' : 'default',
        }}
        onClick={handleOpen}
      >
        {imageSrc ? (
          <img src={imageSrc} alt="proof" />
        ) : (
          <Typography color="text.secondary">Chưa có ảnh chuyển khoản</Typography>
        )}
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none' } }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.3)',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' },
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 0, backgroundColor: 'transparent' }}>
          <img
            src={imageSrc}
            alt="proof large"
            style={{ width: '100%', height: 'auto', maxHeight: '90vh', objectFit: 'contain' }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
