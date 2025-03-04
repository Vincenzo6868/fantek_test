import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { config } from '@/config';
import { ClubTable } from '@/components/dashboard/club/club-table';
import type { Club } from '@/components/dashboard/club/club-table';

export const metadata = { title: `Quản Lý Câu Lạc Bộ | ${config.site.name}` } satisfies Metadata;

const clubs = [
  {
    id: 'USR-010',
    club_name: 'Becamex Bình Dương',
    representative_name: 'Trần Văn A',
    phone: '908-691-3242',
    email: 'tranvana@gmail.com',
    password: 'ftR623i.'
  },
  {
    id: 'USR-009',
    club_name: 'Hà Nội FC',
    representative_name: 'Nguyễn Văn B',
    phone: '908-691-3242',
    email: 'nguyenvanb@gmail.com',
    password: 'uEt@3f7q'
  },
  {
    id: 'USR-008',
    club_name: 'Sài Gòn FC',
    representative_name: 'Trần Văn C',
    phone: '908-691-3242',
    email: 'tranvanc@gmail.com',
    password: 'kiyT09@3'
  },
  {
    id: 'USR-007',
    club_name: 'Hải Phòng FC',
    representative_name: 'Nguyễn Văn D',
    phone: '908-691-3242',
    email: 'nguyenvand@gmail.com',
    password: 'ytUr3@10'
  },
  {
    id: 'USR-006',
    club_name: 'Than Quảng Ninh',
    representative_name: 'Trần Văn E',
    phone: '908-691-3242',
    email: 'tranvane@gmail.com',
    password: '45gTqr3.'
  },
  {
    id: 'USR-005',
    club_name: 'Bình Định FC',
    representative_name: 'Nguyễn Văn F',
    phone: '908-691-3242',
    email: 'nguyenvanf@gmail.com',
    password: '3@1uT4r'
  },
  {
    id: 'USR-004',
    club_name: 'Hồ Chí Minh City',
    representative_name: 'Trần Văn G',
    phone: '908-691-3242',
    email: 'tranvang@gmail.com',
    password: '7y.uT4r'
  },
] satisfies Club[];

export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;

  const paginatedClubs = applyPagination(clubs, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Quản Lý Câu Lạc Bộ</Typography>
          {/* <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}>
              Import
            </Button>
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}>
              Export
            </Button>
          </Stack> */}
        </Stack>
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
          Thêm
          </Button>
        </div>
      </Stack>
      {/* <ClubFilters /> */}
      <ClubTable 
        count={paginatedClubs.length}
        page={page}
        rows={paginatedClubs}
        rowsPerPage={rowsPerPage}
      />
    </Stack>
  );
}

function applyPagination(rows: Club[], page: number, rowsPerPage: number): Club[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
