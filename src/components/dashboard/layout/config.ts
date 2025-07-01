import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  // { key: 'overview', title: 'Trang Chủ', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'club', title: 'Quản Lý Câu Lạc Bộ', href: paths.dashboard.club, icon: 'users' },
  { key: 'player', title: 'Quản Lý Người Chơi', href: paths.dashboard.player, icon: 'user' },
  { key: 'kyc', title: 'Quản Lý Danh Sách KYC', href: paths.dashboard.kyc, icon: 'fingerprint' },
  { key: 'withdraw', title: 'Quản Lý Rút Tiền', href: paths.dashboard.withdraw, icon: 'HandWithdraw' },
  // { key: 'integrations', title: 'Integrations', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  // { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  // { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  // { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];
