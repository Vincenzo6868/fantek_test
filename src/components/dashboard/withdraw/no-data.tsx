import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Database as DatabaseIcon } from '@phosphor-icons/react/dist/ssr/Database';

export interface NoDataProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function NoData({ 
  title = "Không có dữ liệu", 
  description = "Hiện tại không có dữ liệu rút tiền nào để hiển thị.",
  icon
}: NoDataProps): React.JSX.Element {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        py: 8,
        px: 3
      }}
    >
      <Stack spacing={3} sx={{ alignItems: 'center', maxWidth: 'sm', textAlign: 'center' }}>
        <Box
          sx={{
            backgroundColor: 'var(--mui-palette-neutral-100)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
          }}
        >
          {icon || (
            <DatabaseIcon 
              size={40} 
              color="var(--mui-palette-neutral-400)"
            />
          )}
        </Box>
        <Stack spacing={1}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'var(--mui-palette-text-primary)',
              fontWeight: 600
            }}
          >
            {title}
          </Typography>
          <Typography 
            color="text.secondary" 
            variant="body2" 
            sx={{ lineHeight: 1.6 }}
          >
            {description}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
