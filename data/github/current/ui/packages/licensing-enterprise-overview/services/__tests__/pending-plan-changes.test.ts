import {mockFetch} from '@github-ui/mock-fetch'
import {cancelPlanChange} from '../pending-plan-changes'
import {ERRORS} from '../../helpers/constants'

describe('services/pending-plan-changes', () => {
  const basePath = '/test-base-path'
  const url = `${basePath}/pending_plan_changes/?cancel_seats=true`

  test('successful plan change cancellation', async () => {
    mockFetch.mockRouteOnce(
      url,
      {method: 'PUT'},
      {
        json: async () => ({
          success: 'Plan change cancelled successfully',
        }),
      },
    )

    const result = await cancelPlanChange(basePath)
    expect(result).toEqual({
      successMessage: 'Plan change cancelled successfully',
    })
  })

  test('error if response contains error', async () => {
    const error = 'Failed to cancel plan change'
    mockFetch.mockRouteOnce(
      url,
      {method: 'PUT'},
      {
        json: async () => ({
          error,
        }),
      },
    )

    await expect(cancelPlanChange(basePath)).rejects.toThrow(error)
  })

  test('error if the response is invalid', async () => {
    mockFetch.mockRouteOnce(
      url,
      {method: 'PUT'},
      {
        json: async () => null,
      },
    )

    await expect(cancelPlanChange(basePath)).rejects.toThrow(ERRORS.CANCEL_PLAN_CHANGE_FAILED_REASON_UNKNOWN)
  })
})
