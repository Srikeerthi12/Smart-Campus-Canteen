/**
 * Determines if a canteen is currently open based on its openTime and closeTime strings.
 * @param {string} openTime  - e.g. "08:00"
 * @param {string} closeTime - e.g. "22:00"
 * @returns {boolean}
 */
export const isCanteenOpen = (openTime, closeTime) => {
  if (!openTime || !closeTime) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const openMinutes = parseTime(openTime);
  const closeMinutes = parseTime(closeTime);

  // Handle overnight canteens (e.g., open 22:00, close 04:00)
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};

/**
 * Returns a user-friendly status label and color for a canteen.
 */
export const getCanteenStatus = (openTime, closeTime) => {
  const open = isCanteenOpen(openTime, closeTime);
  return {
    isOpen: open,
    label: open ? 'Open Now' : 'Closed',
    className: open ? 'badge-open' : 'badge-closed',
  };
};
