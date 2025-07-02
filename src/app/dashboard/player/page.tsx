import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { PlayerTable } from '@/components/dashboard/player/player-table';

export const metadata = { title: `Quản Lý Cầu Thủ | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Quản Lý Cầu Thủ</Typography>
      </div>
      <PlayerTable />
    </Stack>
  );
}
