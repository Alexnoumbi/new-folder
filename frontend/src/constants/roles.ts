export const AccountTypes = {
  ADMIN: 'admin' as const,
  ENTERPRISE: 'entreprise' as const
} as const;

export type AccountType = typeof AccountTypes[keyof typeof AccountTypes];

export default AccountTypes;
