/**
 * Generate an order code in the format MF-YYMMDD-NNN.
 * The sequence number is zero-padded to 3 digits.
 * The caller must provide the count of existing orders for today.
 */
export function generateOrderCode(
  todayOrderCount: number,
  now: Date = new Date(),
): string {
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const seq = String(todayOrderCount + 1).padStart(3, "0");
  return `MF-${yy}${mm}${dd}-${seq}`;
}
