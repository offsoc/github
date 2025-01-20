import {verifiedFetchJSON} from '@github-ui/verified-fetch'

import {URLS} from '../constants'

import type {Organization} from '../types/organizations'

export const performBusinessOrganizationBillingJobRequest = async (payload: Organization) => {
  const response = await verifiedFetchJSON(
    `${URLS.STAFFTOOLS_BUSINESS_ORGANIZATION_BILLNG_JOB}/${payload.id}/perform`,
    {
      method: 'PUT',
    },
  )
  const data = await response.json()

  return {...data, statusCode: response.status}
}
