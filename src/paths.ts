export const paths = {
  home: '/dashboard/club',
  auth: { signIn: '/auth/sign-in', resetPassword: '/auth/reset-password' },
  dashboard: {
    club: '/dashboard/club',
    player: '/dashboard/player',
    kyc: '/dashboard/kyc',
    withdraw: '/dashboard/withdraw',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
