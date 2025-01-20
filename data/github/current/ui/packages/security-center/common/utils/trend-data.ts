export function calculateTrend(currentValue: number, previousValue: number): number {
  if (currentValue === 0 && previousValue === 0) {
    return 0
  }

  if (previousValue === 0) {
    return Infinity
  }

  // If the value has not changed (current == previous), we subtract 1 to show 0% trend
  return +((currentValue / previousValue - 1) * 100).toFixed(2)
}
