import {isOnTrial} from '../../utils/business'
import {ENTERPRISE_TRIAL_PLAN} from '../../constants'

describe('isOnTrial', () => {
  it('should return true when the plan is ENTERPRISE_TRIAL_PLAN', () => {
    const result = isOnTrial(ENTERPRISE_TRIAL_PLAN)
    expect(result).toBe(true)
  })

  it('should return false when the plan is not ENTERPRISE_TRIAL_PLAN', () => {
    const result = isOnTrial('BASIC_PLAN')
    expect(result).toBe(false)
  })

  it('should return false when the plan is an empty string', () => {
    const result = isOnTrial('')
    expect(result).toBe(false)
  })
})
