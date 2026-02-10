export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/reset/forgot-password',
    RESET_PASSWORD: '/auth/reset/reset-password',
    EMAIL_FOR_TOKEN: '/auth/reset/reset-password/emailid'
  }
} as const;
