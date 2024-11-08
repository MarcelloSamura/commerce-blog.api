import { isNullableValue } from './is-nullable-value.util';

export function formatDate(date: Date): string {
  return String(date.toISOString().split('T')[0]);
}

export const today = formatDate(new Date());

export function checkDates<DateVal = Maybe<string | Date>>(
  start: DateVal,
  end: DateVal,
  isStartToday = false,
): boolean {
  let datefyedStart: Date | undefined;

  if (!isNullableValue(start)) {
    if (typeof start === 'string') {
      datefyedStart = new Date(start);
    } else if (start instanceof Date) {
      datefyedStart = start;
    }
  }

  if (isStartToday && datefyedStart) {
    datefyedStart.setHours(0, 0, 0, 0);
  }

  let datefyedEnd: Date | undefined;

  if (!isNullableValue(end)) {
    if (typeof end === 'string') {
      datefyedEnd = new Date(end);
    } else if (end instanceof Date) {
      datefyedEnd = end;
    }
  }

  if (datefyedStart && datefyedEnd) {
    return datefyedStart <= datefyedEnd;
  }

  return true;
}
