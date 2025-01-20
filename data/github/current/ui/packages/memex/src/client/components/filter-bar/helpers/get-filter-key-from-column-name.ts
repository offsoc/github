export const getFilterKeyFromColumnName = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, '-')
}
