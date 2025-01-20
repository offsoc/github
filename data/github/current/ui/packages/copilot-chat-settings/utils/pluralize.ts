export const pluralizeRepositories = (count: number) => {
  if (count === 1) {
    return `${count} repository`
  }
  return `${count} repositories`
}

export const pluralizeResults = (count: number) => {
  if (count === 1) {
    return `${count} result`
  }
  return `${count} results`
}
