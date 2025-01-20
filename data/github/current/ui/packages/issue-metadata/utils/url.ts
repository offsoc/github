/**
 * Prefixes strings starting w/ www. w/ https:// protocols
 * This is to support link parsing in projects text fields because strings like www.google.com are treated
 * as valid urls, so we want to mirror the same functionality in issues project TextFields
 * @param url
 * @returns {string}
 */
export function prefixUrl(url: string) {
  const prefix = url?.startsWith('www.') ? 'https://' : ''
  return prefix + url
}

/**
 * Check whether a url is valid utilizing URL.canParse
 * @param url
 * @returns {boolean}
 */
export function isValidUrl(url: string) {
  return !!url && URL.canParse(url)
}
