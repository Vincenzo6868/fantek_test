export const paths = {
  home: '/dashboard/club',
  auth: { signIn: '/auth/sign-in', resetPassword: '/auth/reset-password' },
  dashboard: {
    club: '/dashboard/club',
    kyc: '/dashboard/kyc',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
