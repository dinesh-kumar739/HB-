export const ALLOWED_DOMAIN = (
  process.env.EXPO_PUBLIC_ALLOWED_DOMAIN || 'hbplus.fit'
).toLowerCase();

export const DOMAIN_ERROR =
  'Access restricted. Please login using your official domain email.';

export function isAllowedEmail(email?: string | null): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  const at = e.lastIndexOf('@');
  return at > 0 && e.slice(at + 1) === ALLOWED_DOMAIN;
}