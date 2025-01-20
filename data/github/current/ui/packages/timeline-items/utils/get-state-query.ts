import {VALUES} from '../constants/values'

export function getStateQuery(stateReason: string | null | undefined) {
  const result = {
    stateChangeQuery: '',
    stateReasonString: '',
  }
  if (stateReason) {
    let stateReasonKey = `${stateReason}` as keyof typeof VALUES.stateChangeQuery
    if (stateReasonKey in VALUES.stateChangeQuery) {
      result.stateChangeQuery = VALUES.stateChangeQuery[stateReasonKey]
    } else {
      throw new Error('Invalid state reason')
    }
    stateReasonKey = `${stateReason}` as keyof typeof VALUES.issueStateReasonStrings
    if (stateReasonKey in VALUES.issueStateReasonStrings) {
      result.stateReasonString = VALUES.issueStateReasonStrings[stateReasonKey]
    } else {
      throw new Error('Invalid state reason')
    }
  }
  return result
}
