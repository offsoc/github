import {ssrSafeLocation} from '@github-ui/ssr-utils'

export const replacePageNumberInUrl = (url: string, pageNumber: number): string => {
  const urlObject = new URL(url, ssrSafeLocation.origin)
  urlObject.searchParams.set('page', pageNumber.toString())
  return urlObject.toString()
}

export const appendFeatureFlagsToUrl = (url: string, featureFlags?: string): string => {
  const urlObject = new URL(url, ssrSafeLocation.origin)

  if (featureFlags) {
    urlObject.searchParams.set('_features', featureFlags)
  }

  return urlObject.toString()
}
