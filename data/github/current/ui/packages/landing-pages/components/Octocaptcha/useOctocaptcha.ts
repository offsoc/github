import {useCallback, useState} from 'react'

import type {OctocaptchaProps} from './Octocaptcha'

export function useOctocaptcha() {
  const [octocaptchaToken, setOctocaptchaToken] = useState<string | undefined>(undefined)
  const [hasOctocaptchaFailedToLoad, setOctocaptchaFailedToLoad] = useState(false)

  const onOctocaptchaComplete = useCallback<NonNullable<OctocaptchaProps['onComplete']>>(({token}) => {
    setOctocaptchaToken(token)
  }, [])

  const onOctocaptchaLoadError = useCallback<NonNullable<OctocaptchaProps['onLoadError']>>(() => {
    setOctocaptchaFailedToLoad(true)
  }, [])

  return {
    octocaptchaToken,
    hasOctocaptchaFailedToLoad,
    onOctocaptchaComplete,
    onOctocaptchaLoadError,
  }
}
