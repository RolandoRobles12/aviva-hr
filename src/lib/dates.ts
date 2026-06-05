/** Returns whole months elapsed from a YYYY-MM-DD string to today. */
export function monthsSince(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  const from = new Date(dateStr);
  if (isNaN(from.getTime())) return 0;
  const now = new Date();
  return Math.max(
    0,
    (now.getFullYear() - from.getFullYear()) * 12 +
      (now.getMonth() - from.getMonth()),
  );
}
