import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {ERRORS} from '../helpers/constants'

type CancelPlanChangeResponse = {error: string} | {success: string}
interface CancelPlanChangeResult {
  successMessage: string
}
export async function cancelPlanChange(basePath: string): Promise<CancelPlanChangeResult> {
  // The route here isn't set up for 'enterprises'; replace the first instance with 'businesses'
  basePath = basePath.replace(/enterprises/, 'businesses')

  const response = await verifiedFetchJSON(`${basePath}/pending_plan_changes/?cancel_seats=true`, {
    method: 'PUT',
  })

  const result = (await response.json()) as CancelPlanChangeResponse
  if (!result) {
    throw new Error(ERRORS.CANCEL_PLAN_CHANGE_FAILED_REASON_UNKNOWN)
  }

  if ('error' in result) {
    throw new Error(result.error)
  }

  return {
    successMessage: result.success,
  }
}
