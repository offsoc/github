import type {Item, SpecKey} from './command-tree'

// Sort non-numeric keys before numeric keys.
export function sortSubtreeValues(a: [string, Item], b: [string, Item]) {
  const isANum = isNumeric(a[0])
  const isBNum = isNumeric(b[0])

  if (isANum && isBNum) {
    return Number(a[0]) - Number(b[0])
  } else if (isANum && !isBNum) {
    return 1
  } else if (!isANum && isBNum) {
    return -1
  } else {
    return a[0].localeCompare(b[0])
  }
}

function isNumeric(key: SpecKey) {
  return /^\d+$/.test(key)
}
