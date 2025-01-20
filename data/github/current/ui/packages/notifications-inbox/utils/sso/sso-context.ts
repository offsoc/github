import {createContext} from 'react'

type SsoPayload = {
  baseAvatarUrl: string
  ssoOrgs: Array<{[key: string]: string}>
}

export const SsoContext = createContext<SsoPayload>({baseAvatarUrl: '', ssoOrgs: []})
export type {SsoPayload}
