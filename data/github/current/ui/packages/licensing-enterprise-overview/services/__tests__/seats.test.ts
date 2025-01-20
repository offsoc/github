import {mockFetch} from '@github-ui/mock-fetch'
import {updateSeats} from '../seats'
import {getPendingPlanChange} from '../../test-utils/mock-data'
import {ERRORS} from '../../helpers/constants'

describe('services/seats', () => {
  const basePath = '/test-base-path'

  test('successful plan change cancellation', async () => {
    const newSeats = 10
    const url = `${basePath}/settings/billing/change_seats?seats=${newSeats}`
    mockFetch.mockRouteOnce(
      url,
      {method: 'PUT'},
      {
        json: async () => ({
          success: 'Plan change cancelled successfully',
          newPayment: 'newPayment',
          newPendingCycleChange: getPendingPlanChange(),
          newSeatCount: 10,
        }),
      },
    )

    const result = await updateSeats(basePath, newSeats)
    expect(result).toEqual({
      successMessage: 'Plan change cancelled successfully',
      newPayment: 'newPayment',
      newPendingCycleChange: getPendingPlanChange(),
      newSeatCount: 10,
    })
  })

  test('error if response contains error', async () => {
    const newSeats = 10
    const url = `${basePath}/settings/billing/change_seats?seats=${newSeats}`
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

    await expect(updateSeats(basePath, newSeats)).rejects.toThrow(error)
  })

  test('error if the response is invalid', async () => {
    const newSeats = 10
    const url = `${basePath}/settings/billing/change_seats?seats=${newSeats}`
    mockFetch.mockRouteOnce(
      url,
      {method: 'PUT'},
      {
        json: async () => null,
      },
    )

    await expect(updateSeats(basePath, newSeats)).rejects.toThrow(ERRORS.UPDATE_SEATS_FAILED_REASON_UNKNOWN)
  })
})
