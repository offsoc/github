import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {useMemo} from 'react'

/**
 * Hook to get the SSO payload from the app payload
 *
 * @description If the app payload is not available, this hook will still return
 * an object with empty arrays for the SSO organizations and the default URLs
 *
 * @returns {SsoPayload} The SSO payload
 */
export const useSso = () => {
  const payload = useAppPayload<SsoAppPayload>()
  const ssoPayload = useMemo(() => {
    const ssoOrgs = payload?.sso_organizations ?? []
    const baseAvatarUrl = payload?.base_avatar_url ?? 'https://avatars.githubusercontent.com'
    return {ssoOrgs, baseAvatarUrl}
  }, [payload?.sso_organizations, payload?.base_avatar_url])

  return ssoPayload
}

export type SsoAppPayload = {
  base_avatar_url: string
  sso_organizations: Array<{[key: string]: string}>
}
