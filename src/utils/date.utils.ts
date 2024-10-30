export function formatDate(date: Date): string {
  return String(date.toISOString().split('T')[0]);
}

export const today = formatDate(new Date());
