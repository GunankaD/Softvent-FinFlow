export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/reset/forgot-password',
    RESET_PASSWORD: '/auth/reset/reset-password',
    EMAIL_FOR_TOKEN: '/auth/reset/reset-password/email',
    SIGNUP_INIT: '/auth/signup/init',
    SIGNUP_VERIFY: '/auth/signup/verify',
    SIGNUP_COMPLETE: '/auth/signup/complete',
  },

  CUSTOMERS: {
    BASE: '/customers',
    BY_ID: (id: number) => `/customers/id/${id}`, // dev only
    BY_CCODE: (ccode: string) => `/customers/${ccode}`,
    AVAILABILITY_CCODE: '/customers/availability/ccode',
    AVAILABILITY_EMAIL: '/customers/availability/email',
    INVOICES: (ccode: string, filter?: string) => `/customers/${ccode}/invoices${filter ? `?filter=${filter}` : ''}`,
    RECEIPTS: (ccode: string, filter?: string) => `/customers/${ccode}/receipts${filter ? `?filter=${filter}` : ''}`,
  },
  
  ITEMS: {
    BASE: '/items',
    BY_ICODE: (icode: string) => `/items/${icode}`,
    AVAILABILITY: (icode: string) => `/items/availability/${icode}`
  },

  ITEM_GROUPS: {
    BASE: '/item-groups',
    BY_IGD: (igid: number) => `/item-groups/${igid}`
  },

  INVOICES: {
    BASE: '/invoices',
    BY_NUMBER: (invoiceNumber: string) => `/invoices/${invoiceNumber}`
  },

  RECEIPTS: {
    BASE: '/receipts',
    BY_NUMBER: (receiptNumber: string) => `/receipts/${receiptNumber}`
  },

  PAYMENT_APPLICATIONS: {
    APPLY: '/payments/apply'
  }

} as const;
