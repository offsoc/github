export const isCurrentLink = (options: {url: string; actual?: string}) => {
  if (options.actual === undefined) {
    return false
  }

  const url = new URL(options.url, undefined)
  const actual = new URL(options.actual, undefined)

  return url.hostname === actual.hostname && url.pathname === actual.pathname
}
