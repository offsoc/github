function padded(num: number): string {
  return String(num).padStart(2, '0')
}

export function prettifyDuration(startDate: number, endDate: number): string {
  const milliseconds = endDate - startDate
  const minutes = Math.floor(milliseconds / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const remainingHours = hours % 24
  const remainingMinutes = minutes % 60

  let result = ''

  if (days > 0) {
    result += `${padded(days)}d `
  }
  if (remainingHours > 0 || days > 0) {
    result += `${padded(remainingHours)}h `
  }
  result += `${padded(remainingMinutes)}m`

  return result.trim()
}
