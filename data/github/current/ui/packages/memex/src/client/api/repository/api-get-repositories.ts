import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import type {GetSuggestedRepositoriesResponse} from './contracts'

type GetRepositoriesOptions = {
  memexNumber?: number
  repositoryId?: number
  onlyWithIssueTypes?: boolean
  milestone?: string
}

export async function apiGetRepositories({
  memexNumber,
  repositoryId,
  onlyWithIssueTypes,
  milestone,
}: GetRepositoriesOptions): Promise<GetSuggestedRepositoriesResponse> {
  const apiData = getApiMetadata('suggested-repositories-api-data')
  const url = new URL(apiData.url, window.location.origin)
  if (memexNumber != null) {
    url.searchParams.append('memexNumber', `${memexNumber}`)
  }
  if (repositoryId != null) {
    url.searchParams.append('repositoryId', `${repositoryId}`)
  }
  if (onlyWithIssueTypes) {
    url.searchParams.append('with_issue_types', 'true')
  }
  if (milestone) {
    url.searchParams.append('milestone', milestone)
  }
  const {data} = await fetchJSON<GetSuggestedRepositoriesResponse>(url)

  return data
}
