import {useTheme} from '@primer/react'

import {getInitialState} from './initial-state'
import type {MediaUrlKeyLookup, MediaUrls} from './json-island'

function useGetMediaUrlThemeSuffix(): 'Dark' | 'Light' {
  const {resolvedColorScheme} = useTheme()
  const isDarkMode = resolvedColorScheme?.startsWith('dark')
  if (isDarkMode) {
    return 'Dark'
  }
  return 'Light'
}

/**
 * Returns a url for a media asset, based on the current theme.
 * This function will look up based on two levels of indexing:
 * 1. A top level feature area, such as 'projectTemplateDialog'
 * 2. A specific asset within that area, such as 'backlog'
 *
 * Next, it will determine whether or not to use the 'Dark' or 'Light' theme, and
 * find the url in the MediaUrls object based on that concatenated key.
 * @param featureArea A top-level key to the MediaUrls object
 * @param assetKey The specific asset within the feature area.
 * @returns
 */
export function useThemedMediaUrl<K1 extends keyof MediaUrls>(featureArea: K1, assetKey: MediaUrlKeyLookup[K1]) {
  const themeSuffix = useGetMediaUrlThemeSuffix()
  const mediaUrls = getInitialState().mediaUrls

  const url = mediaUrls?.[featureArea]?.[`${assetKey}${themeSuffix}` as keyof MediaUrls[K1]]
  return url ? encodeURI(url.toString()) : ''
}
