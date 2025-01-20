import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {ChangesInProgress} from '../security-products-enablement-types'
import {
  settingsOrgSecurityProductsEnablementInProgressPath,
  settingsOrgSecurityProductsRefreshPath,
} from '@github-ui/paths'

export async function fetchInProgressStatus(org: string, repositoryIds?: number[]) {
  const result = await verifiedFetchJSON(settingsOrgSecurityProductsEnablementInProgressPath({org}), {
    method: 'POST',
    body: {repository_ids: repositoryIds},
  })

  if (result.ok) return (await result.json()) as ChangesInProgress
}

export async function fetchRefresh(org: string, repositoryIds?: number[]) {
  const fetchOptions = repositoryIds ? {method: 'POST', body: {repository_ids: repositoryIds}} : {method: 'GET'}
  const result = await verifiedFetchJSON(settingsOrgSecurityProductsRefreshPath({org}), fetchOptions)

  if (result.ok) return await result.json()
}
