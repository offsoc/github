import {ssrSafeLocation} from '@github-ui/ssr-utils'

export function grabAndAppendUrlParameters() {
  const urlObject = new URL(
    ssrSafeLocation.origin + ssrSafeLocation.pathname + ssrSafeLocation.search,
    ssrSafeLocation.origin,
  )

  // return just the search params already appended for soft navs to keep it consistent
  return urlObject.search
}
