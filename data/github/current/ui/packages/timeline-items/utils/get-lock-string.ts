import {VALUES} from '../constants/values'

export function getLockString(lockReason: string | null | undefined) {
  let lockReasonString = ''
  if (lockReason) {
    const lockReasonKey = `${lockReason}` as keyof typeof VALUES.lockedReasonStrings
    if (lockReasonKey in VALUES.lockedReasonStrings) {
      lockReasonString = VALUES.lockedReasonStrings[lockReasonKey]
    } else {
      throw new Error('Invalid lock reason')
    }
  }
  return lockReasonString
}
