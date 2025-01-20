import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import {rolesMap} from '../common-contracts'
import type {IUpdateOrganizationAccessRequest} from './contracts'

export async function apiUpdateOrganizationAccess({role}: IUpdateOrganizationAccessRequest): Promise<void> {
  const apiData = getApiMetadata('memex-update-organization-access-api-data')
  await fetchJSONWith(apiData.url, {
    method: 'PUT',
    body: {permission: rolesMap.get(role)},
  })
}
