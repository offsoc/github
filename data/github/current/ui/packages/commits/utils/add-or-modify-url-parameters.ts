import {ssrSafeLocation} from '@github-ui/ssr-utils'

export function addOrModifyUrlParameters(
  parameters: Record<string, string | number | boolean>,
  parametersToRemove: string[],
): string {
  const urlObject = new URL(
    ssrSafeLocation.origin + ssrSafeLocation.pathname + ssrSafeLocation.search,
    ssrSafeLocation.origin,
  )
  const searchParams = urlObject.searchParams

  for (const key of parametersToRemove) {
    if (searchParams.has(key)) searchParams.delete(key)
  }

  for (const [key, value] of Object.entries(parameters)) {
    searchParams.set(key, value.toString())
  }

  // return relative url for soft navs
  return urlObject.pathname + urlObject.search
}
