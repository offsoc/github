export const generateColor = (index: number) => {
  const letters = '0123456789ABCDEF'
  let color = ''
  for (let i = 1; i <= 6; i++) {
    color += letters[(index * i) % 16]
  }
  return color
}
