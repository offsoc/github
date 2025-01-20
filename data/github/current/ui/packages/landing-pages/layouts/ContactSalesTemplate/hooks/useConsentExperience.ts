import {useCallback, useState} from 'react'

/* eslint filenames/match-regex: off */
export function useConsentExperience() {
  const [isConsentExperienceValid, setConsentExperienceValidation] = useState(true)

  /**
   * useCallback is used here to memoize the function, so that it is not recreated on every render & does not
   * cause the underlying ConsentExperience component to re-render.
   */
  const onConsentExperienceValidationChange = useCallback((isValid: boolean) => {
    setConsentExperienceValidation(isValid)
  }, [])

  return {
    isConsentExperienceValid,
    onConsentExperienceValidationChange,
  }
}
