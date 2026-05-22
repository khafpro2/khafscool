export const DEFAULT_CONTACT_EMAIL = 'KTHIAM@HARMYTECH.COM';

export function getContactEmail(): string {
  return (
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ??
    process.env.CONTACT_EMAIL ??
    DEFAULT_CONTACT_EMAIL
  );
}

export function getContactMailto(): string {
  return `mailto:${getContactEmail()}`;
}
