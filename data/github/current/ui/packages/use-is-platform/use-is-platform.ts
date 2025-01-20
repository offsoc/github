import {useClientValue} from '@github-ui/use-client-value'

export type Platform = 'windows' | 'mac'

/**
 * SSR-friendly hook to retrieve information about the user platform.
 *
 * @param platforms @type {Array<Platform>} platforms to check
 * @returns {boolean} true if user platform matches one of the provided platforms.
 */
export function useIsPlatform(platforms: Platform[]): boolean {
  const platformsString = platforms.join(',')
  const [result] = useClientValue(
    () => {
      const platform = getPlatform()
      return !!platform && platformsString.includes(platform)
    },
    false,
    [platformsString],
  )

  return result
}

function getPlatform(): Platform | null {
  if (/Windows/.test(navigator.userAgent)) {
    return 'windows'
  }
  if (/Macintosh/.test(navigator.userAgent)) {
    return 'mac'
  }
  return null
}
