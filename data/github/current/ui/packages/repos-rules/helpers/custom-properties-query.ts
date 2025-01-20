import type {PropertyConfiguration, RepositoryPropertyParameters} from '../types/rules-types'

export function buildQueryForProperty(property: PropertyConfiguration, negationPrefix: string): string {
  const valueString = property.property_values.map(quoteIfNeeded).join(',')
  const propPrefix = property.source === 'system' ? '' : 'props.'
  return `${negationPrefix}${propPrefix}${property.name}:${valueString}`
}

function quoteIfNeeded(value: string) {
  return value.includes(' ') ? `"${value}"` : value
}

export function buildQueryForAllProperties(properties: RepositoryPropertyParameters): string {
  const includeParts = properties.include.map(property => buildQueryForProperty(property, ''))
  const excludeParts = properties.exclude.map(property => buildQueryForProperty(property, '-'))

  return [...includeParts, ...excludeParts].join(' ')
}
