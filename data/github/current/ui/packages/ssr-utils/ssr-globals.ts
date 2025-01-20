// When using SSR, browser globals are not available. If you try to use them, Node.js will throw an error
type SSRSafeLocation = Pick<Location, 'pathname' | 'origin' | 'search' | 'hash' | 'href'>

// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
export const ssrSafeDocument = typeof document === 'undefined' ? undefined : document
// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
export const ssrSafeWindow = typeof window === 'undefined' ? undefined : window
// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
export const ssrSafeHistory = typeof history === 'undefined' ? undefined : history

export const ssrSafeLocation: SSRSafeLocation =
  // eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
  typeof location === 'undefined' ? {pathname: '', origin: '', search: '', hash: '', href: ''} : location

export function setLocation(url: string) {
  // eslint-disable-next-line no-restricted-syntax
  const parsedURL: SSRSafeLocation = new URL(url)
  const {pathname, origin, search, hash} = parsedURL

  Object.assign(ssrSafeLocation, {pathname, origin, search, hash})
}
