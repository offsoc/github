import {verifiedFetchJSON, type JSONRequestInit} from '@github-ui/verified-fetch'
import {useState} from 'react'

enum VALIDATION_RESULT {
  INVALID,
  VALID,
  UNKNOWN,
}

export function useAsyncValidation(baseValidationUrl: string, type: string) {
  const [validityResult, setValidityResult] = useState(VALIDATION_RESULT.UNKNOWN)

  const isValid = validityResult === VALIDATION_RESULT.VALID
  const showError = validityResult === VALIDATION_RESULT.INVALID

  const validate = async (value: object, header: JSONRequestInit = {}): Promise<boolean> => {
    setValidityResult(VALIDATION_RESULT.UNKNOWN)

    if (!type) {
      return true
    }

    const result = await requestServerResult(value, `${baseValidationUrl}/${type}`, header)
    setValidityResult(result)
    return resultValidity(result)
  }

  const reset = (forceValid = false) => {
    setValidityResult(forceValid ? VALIDATION_RESULT.VALID : VALIDATION_RESULT.UNKNOWN)
  }

  return {
    isValid,
    showError,
    validate,
    reset,
  }
}

const requestServerResult = async (body: object, url: string, header?: JSONRequestInit): Promise<VALIDATION_RESULT> => {
  const response = await verifiedFetchJSON(url, {
    ...header,
    method: 'POST',
    body,
  })

  if (response.ok) {
    const {valid} = await response.json()
    return valid ? VALIDATION_RESULT.VALID : VALIDATION_RESULT.INVALID
  } else if (response.status === 400) {
    return VALIDATION_RESULT.INVALID
  } else {
    return VALIDATION_RESULT.UNKNOWN
  }
}

const resultValidity = (result: VALIDATION_RESULT) => {
  switch (result) {
    case VALIDATION_RESULT.VALID:
    case VALIDATION_RESULT.UNKNOWN:
      return true
    case VALIDATION_RESULT.INVALID:
      return false
  }
}

export const requestServerValidation = async (body: object, url: string): Promise<boolean> =>
  resultValidity(await requestServerResult(body, url))
