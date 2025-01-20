import {apiGetRepositories} from '../../../client/api/repository/api-get-repositories'
import type {SuggestedRepository} from '../../../client/api/repository/contracts'
import {stubResolvedApiResponse} from './memex'

export function stubGetRepositories(repositories: Array<SuggestedRepository>) {
  return stubResolvedApiResponse(apiGetRepositories, {repositories})
}
