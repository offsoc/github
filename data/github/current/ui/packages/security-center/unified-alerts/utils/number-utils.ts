export function formatCount(count: number): string {
  if (count > 999) {
    // Truncate display to something like "4.2k"
    return `${(count / 1000).toFixed(1)}k`
  }

  return count.toLocaleString()
}
