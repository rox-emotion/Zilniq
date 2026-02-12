export function transformNowIntoTimestamp(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function capitalize(text: string): string {
  return text[0].toUpperCase() + text.slice(1);
}

export function normalizeDate(timestamp?: string): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatTimeForUser(mealTime: string, loggedInTimezone: string): string {
  const date = new Date(mealTime);
  console.log(date)

  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: loggedInTimezone
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}