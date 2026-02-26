export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/reset/forgot-password',
    RESET_PASSWORD: '/auth/reset/reset-password',
    EMAIL_FOR_TOKEN: '/auth/reset/reset-password/emailid'
  },

  CUSTOMERS: {
    BASE: '/customers',
    BY_ID: (id: number) => `/customers/id/${id}`, // dev only
    BY_CCODE: (ccode: string) => `/customers/ccode/${ccode}`,
    AVAILABILITY_CCODE: '/customers/availability/ccode',
    AVAILABILITY_EMAIL: '/customers/availability/emailid'
  }
} as const;
