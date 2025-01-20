export function rangeBounds(range: string | undefined): {min: number | undefined; max: number | undefined} | undefined {
  if (typeof range === 'undefined') {
    return undefined
  }

  let [min, max] = range.split('..').map(num => parseInt(num))

  if (min === undefined || isNaN(min)) {
    min = undefined
  }

  if (max === undefined || isNaN(max)) {
    max = undefined
  }

  return {min, max}
}

export function rangeToArray(range: string) {
  const bounds = rangeBounds(range)
  if (!bounds) throw new Error('Invalid range')

  const {min, max} = bounds

  if (min === undefined || max === undefined) {
    throw new Error('Invalid range')
  }

  return Array.from({length: max - min + 1}, (_, i) => min + i)
}
