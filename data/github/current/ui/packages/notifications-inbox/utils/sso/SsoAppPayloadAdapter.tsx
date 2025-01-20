import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {type FC, type ReactNode, useMemo} from 'react'

import {URLS} from './constants'
import {SsoContext} from './sso-context'

export type SsoAppPayload = {
  base_avatar_url: string
  sso_organizations: Array<{[key: string]: string}>
}

export const SsoAppPayloadAdapter: FC<{children: ReactNode}> = ({children}) => {
  const payload = useAppPayload<SsoAppPayload>()
  const ssoPayload = useMemo(() => {
    const ssoOrgs = payload?.sso_organizations ?? []
    const baseAvatarUrl = payload?.base_avatar_url ?? URLS.defaultBaseAvatarUrl
    return {ssoOrgs, baseAvatarUrl}
  }, [payload?.sso_organizations, payload?.base_avatar_url])

  return <SsoContext.Provider value={ssoPayload}>{children}</SsoContext.Provider>
}
