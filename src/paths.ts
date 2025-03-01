export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    club: '/dashboard/club',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
