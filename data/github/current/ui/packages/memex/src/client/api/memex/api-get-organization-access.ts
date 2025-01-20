import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith, type RequestInitOverride} from '../../platform/functional-fetch-wrapper'
import type {BackwardsCompatibleGetOrganizationAccessResponse, GetOrganizationAccessResponse} from './contracts'

export async function apiGetOrganizationAccess(opts?: RequestInitOverride): Promise<GetOrganizationAccessResponse> {
  const {url} = getApiMetadata('memex-get-organization-access-api-data')
  const {data} = await fetchJSONWith<BackwardsCompatibleGetOrganizationAccessResponse>(url, opts)
  return {role: data.role ?? data.permission}
}
