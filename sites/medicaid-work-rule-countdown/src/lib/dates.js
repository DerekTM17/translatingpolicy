// Calendar-day math in the viewer's local time zone.

// Use a stable primitive so seconds ticking within one day do not redraw the page.
export function localDayKey(now = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
}

export function subscribeToLocalDay(check, win = window, doc = document) {
  const timer = win.setInterval(check, 15_000);
  win.addEventListener('focus', check);
  win.addEventListener('pageshow', check);
  doc.addEventListener('visibilitychange', check);
  return () => {
    win.clearInterval(timer);
    win.removeEventListener('focus', check);
    win.removeEventListener('pageshow', check);
    doc.removeEventListener('visibilitychange', check);
  };
}

/** Days from `now` to the ISO date `iso` (YYYY-MM-DD). Negative once past. */
export function daysUntil(iso, now = new Date()) {
  const [y, m, d] = iso.split('-').map(Number);
  const target = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Dec 11, 2026" from "2026-12-11". */
export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return MONTHS[m - 1] + ' ' + d + ', ' + y;
}

/** Parse an ISO date to a local Date at noon (safe for D3 time scales). */
export function toDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}
