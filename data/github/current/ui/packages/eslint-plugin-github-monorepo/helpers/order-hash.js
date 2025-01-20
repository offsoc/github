// @ts-check
/**
 * @param {Record<string, unknown>} obj
 * @returns {Record<string, unknown>}
 */
const orderHash = obj => {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => {
      const lowerA = a.toLowerCase()
      const lowerB = b.toLowerCase()
      if (lowerA < lowerB) return -1
      if (lowerA > lowerB) return 1
      return 0
    }),
  )
}

module.exports = orderHash
