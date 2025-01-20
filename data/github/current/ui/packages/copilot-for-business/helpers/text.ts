export function pluralize(count: number, text: string, suffix: string, showCount = true) {
  if (count === 1) {
    return showCount ? `${count} ${text}` : text
  }

  return showCount ? `${count} ${text}${suffix}` : `${text}${suffix}`
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export const formatDate = (billingDate: string) => {
  const date = new Date(billingDate)
  const day = date.getDate()
  const month = date.toLocaleString('default', {month: 'long'})
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}
