export const formatMoneyDisplay = (value: number, digits = 2): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: digits,
  })

  let formattedValue

  if (value === 0) formattedValue = '$0'
  else if (0 < value && value < 0.01 && digits === 2) formattedValue = '<$0.01'
  else formattedValue = formatter.format(value)

  return formattedValue
}
