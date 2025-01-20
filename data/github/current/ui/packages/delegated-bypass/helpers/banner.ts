import type {SetURLSearchParams} from 'react-router-dom'
import type {Banner} from '../contexts/DelegatedBypassBannerContext'
import {UpdateState} from './constants'

export function updateBanner(
  updateState: UpdateState,
  setBanner: (banner: Banner) => void,
  setSearchParams: SetURLSearchParams,
  successVerb: string,
  failureVerb: string,
) {
  switch (updateState) {
    case UpdateState.Success:
      setBanner({
        message: `Your response was ${successVerb}`,
        variant: 'success',
      })
      setSearchParams(params => {
        params.set('success', '')
        return params
      })
      break
    case UpdateState.Error:
      setBanner({
        message: `There was an error ${failureVerb} your response`,
        variant: 'danger',
      })
      break
    default:
      break
  }
}
