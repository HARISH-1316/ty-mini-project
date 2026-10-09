// ──────────────────────────────────────────────
// Date and Time Utility Functions
// ──────────────────────────────────────────────

/**
 * Converts a server ISO date string / Date object into 'YYYY-MM-DDTHH:mm'
 * for native HTML5 <input type="datetime-local"> using the user's LOCAL timezone.
 */
export const toLocalDatetimeInputString = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Converts a local datetime string from <input type="datetime-local"> ('YYYY-MM-DDTHH:mm')
 * into a UTC ISO 8601 string ('YYYY-MM-DDTHH:mm:ss.sssZ') for the backend API.
 */
export const toUtcIsoString = (localDatetimeStr) => {
  if (!localDatetimeStr) return null;
  const d = new Date(localDatetimeStr);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
};

/**
 * Formats a date for human-readable display in the local timezone.
 * Example: '9 Oct 2026, 2:30 pm'
 */
export const formatDisplayDateTime = (dateInput) => {
  if (!dateInput) return 'Not set';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};
