export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidPhone(value: string): boolean {
  const phone = normalizePhone(value);
  return phone.length === 11 || phone.length === 12;
}

export function formatPhone(value: string): string {
  const phone = normalizePhone(value);

  if (phone.length === 11 && phone.startsWith('7')) {
    return `+7 ${phone.slice(1, 4)} ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9)}`;
  }

  if (phone.length === 12 && phone.startsWith('375')) {
    return `+375 ${phone.slice(3, 5)} ${phone.slice(5, 8)}-${phone.slice(8, 10)}-${phone.slice(10)}`;
  }

  return value;
}
