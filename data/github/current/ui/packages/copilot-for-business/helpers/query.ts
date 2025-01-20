export const createURLParams = (data: Record<string, unknown>) => {
  const stringed = Object.entries(data).reduce(
    (memo, [k, v]: [k: string, value: unknown]) => {
      if (typeof v !== 'string') {
        memo[k] = JSON.stringify(v)
      } else {
        memo[k] = v
      }

      return memo
    },
    {} as Record<string, string>,
  )
  return new URLSearchParams(stringed).toString()
}
