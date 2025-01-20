import {useContext} from 'react'

import {SsoContext} from '../sso-context'

/**
 * Hook to get the SSO payload from the app payload
 *
 * @description If the app payload is not available, this hook will still return
 * an object with empty arrays for the SSO organizations and the default URLs
 *
 * @returns {SsoPayload} The SSO payload
 */
const useSso = () => {
  return useContext(SsoContext)
}

export default useSso
