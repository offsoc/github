import {NO_MATCH, fuzzyScore} from './fuzzy-score'

type fuzzyFilterProps<T> = {
  items: T[]
  filter: string
  key: (option: T) => string
  // Used when you want to compare against two attributes, and take the highest score.
  // An example could be comparing against a users login, and then name, and taking the highest score.
  secondaryKey?: (option: T) => string
}

export const fuzzyFilter = <T>({items, filter, key, secondaryKey}: fuzzyFilterProps<T>): T[] => {
  let filteredItems = items.map(i => [fuzzyScore(filter, key(i)), i] as const)

  if (secondaryKey) {
    filteredItems = filteredItems.map(
      ([keyScore, i]) => [Math.max(keyScore, fuzzyScore(filter, secondaryKey(i))), i] as const,
    )
  }

  return filteredItems
    .filter(([s]) => s > NO_MATCH)
    .sort(([aScore, a], [bScore, b]) => {
      if (bScore === aScore) {
        // Default to sorting alphabetically if scores are the same.
        return key(a).localeCompare(key(b))
      }
      return bScore - aScore
    })
    .map(([, o]) => o)
}
