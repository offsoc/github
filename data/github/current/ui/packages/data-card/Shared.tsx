export function ColorByIndex(index: number) {
  const colors = ['accent.emphasis', 'success.emphasis', 'danger.emphasis', 'done.emphasis']
  return colors[index % colors.length]
}
