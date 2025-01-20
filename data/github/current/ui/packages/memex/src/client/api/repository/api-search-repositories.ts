import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import type {SearchRepositoriesResponse} from './contracts'

type SearchRepositoriesOptions = {
  query: string
  onlyWithIssueTypes?: boolean
  milestone?: string
}

export async function apiSearchRepositories({
  query,
  onlyWithIssueTypes,
  milestone,
}: SearchRepositoriesOptions): Promise<SearchRepositoriesResponse> {
  const apiData = getApiMetadata('search-repositories-api-data')
  const url = new URL(apiData.url, window.location.origin)
  url.searchParams.set('q', query)
  if (onlyWithIssueTypes) {
    url.searchParams.append('with_issue_types', 'true')
  }
  if (milestone) {
    url.searchParams.append('milestone', milestone)
  }
  const {data} = await fetchJSON<SearchRepositoriesResponse>(url)

  return data
}
