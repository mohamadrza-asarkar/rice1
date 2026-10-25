/**
 * Truncates text at the nearest space/word boundary without cutting words in half.
 * @param {string} text - The input text
 * @param {number} maxLength - The desired maximum length
 * @returns {string} - Cleanly truncated string with ellipsis
 */
export function truncateAtWord(text, maxLength = 65) {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;

  const slice = trimmed.slice(0, maxLength);
  const lastSpaceIndex = slice.lastIndexOf(' ');

  if (lastSpaceIndex > 0) {
    return slice.slice(0, lastSpaceIndex) + '...';
  }
  return slice + '...';
}

/**
 * Converts English digits to Persian digits
 */
export function toFaDigits(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
}
