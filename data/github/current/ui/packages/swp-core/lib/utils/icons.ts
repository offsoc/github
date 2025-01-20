// eslint-disable-next-line import/no-namespace
import * as Primer from '@primer/octicons-react'

const toTitleCase = (str: string) => {
  return `${str
    .toLowerCase()
    .split('-')
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join('')}Icon`
}

export const getPrimerIcon = (name: string = ''): Primer.Icon | undefined => {
  const titleCaseName = toTitleCase(name)
  const iconMap: {[key: string]: Primer.Icon} = Primer
  return iconMap[titleCaseName] ? iconMap[titleCaseName] : undefined
}
