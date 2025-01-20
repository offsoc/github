import type {
  GetSuggestedRepositoriesResponse,
  SearchRepositoriesResponse,
  SearchRepositoryItemsResponse,
} from '../../client/api/repository/contracts'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {
  get_countIssuesAndPulls,
  get_getSuggestedRepositories,
  get_searchIssuesAndPulls,
  get_searchSuggestedRepositories,
} from '../msw-responders/repositories'
import {BaseController} from './base-controller'

export class RepositoriesController extends BaseController {
  public async getRepositories(): Promise<GetSuggestedRepositoriesResponse> {
    await this.server.sleep()
    const repositories = this.db.repositories.all()
    this.log(`fetching suggested repositories: found ${repositories.length}`)
    return {repositories}
  }

  public async suggestedRepositories(repositoryId?: number): Promise<GetSuggestedRepositoriesResponse> {
    await this.server.sleep()
    const {repositories} = await this.getRepositories()
    const suggestions = repositories.slice(0, 8)
    if (repositoryId) {
      const targetRepository = repositories.filter(repo => repo.id === repositoryId)
      if (!suggestions.some(repo => repo.id === repositoryId)) {
        suggestions.push(...targetRepository)
      }
    }
    this.log(`fetching suggested repositories: found ${suggestions.length}`)
    return {
      repositories: suggestions,
    }
  }

  public async searchRepositories(query: string): Promise<SearchRepositoriesResponse> {
    const queryRe = new RegExp(query, 'gi')
    const {repositories} = await this.getRepositories()
    const suggestions = repositories.filter(s =>
      query.includes('/') ? s.nameWithOwner.match(queryRe) : s.name.match(queryRe),
    )

    this.log(`searching repositories: found ${suggestions.length}`)

    return {
      repositories: suggestions,
    }
  }

  public async searchRepositoryItems(
    repositoryId: number,
    query: string | undefined,
    memexNumber: number | undefined,
    shouldHaveItems: boolean,
    hasManyItems: boolean,
  ): Promise<SearchRepositoryItemsResponse> {
    await this.server.sleep()

    let results = this.db.repositoryItems.all().filter(i => !this.db.memexItems.exists(i.type, i.id))
    if (query) {
      results = results.filter(r => r.number.toString() === query || r.title.match(new RegExp(query, 'gi')))
    }

    let manyItems = this.db.repositoryItems.getManyItems().filter(i => !this.db.memexItems.exists(i.type, i.id))

    // emulating the `limit` param which only allows max 25 items to be shown in the side panel
    if (manyItems.length > 25) {
      manyItems = manyItems.slice(0, 25)
    }

    this.log(
      `searching repository ${repositoryId}${
        memexNumber ? ` in memex ${memexNumber}` : ''
      } for items matching '${query}': found ${results.length}`,
    )

    return {issuesAndPulls: hasManyItems ? manyItems : shouldHaveItems ? results : []}
  }

  public override handlers = [
    get_getSuggestedRepositories(async (_body, req) => {
      const params = new URL(req.url).searchParams
      const repositoryId = params.get('repositoryId')
      return this.suggestedRepositories(repositoryId ? parseInt(repositoryId, 10) : undefined)
    }),
    get_searchSuggestedRepositories(async (_body, req) => {
      const params = new URL(req.url).searchParams
      const query = params.get('q') ?? ''
      return this.searchRepositories(query)
    }),
    get_searchIssuesAndPulls(async (_body, req) => {
      const params = new URL(req.url).searchParams

      const repositoryId = not_typesafe_nonNullAssertion(params.get('repositoryId'))
      const query = not_typesafe_nonNullAssertion(params.get('q'))
      const memexNumber = params.get('memexNumber')

      return this.searchRepositoryItems(
        parseInt(repositoryId, 10),
        query,
        memexNumber ? parseInt(memexNumber, 10) : undefined,
        // providing `shouldBeEmpty` param to create an empty repo for testing
        repositoryId === '7' ? false : true,
        // providing `hasManyItems` param to create a repo with > 25 items for testing
        repositoryId === '8' ? true : false,
      )
    }),
    get_countIssuesAndPulls(async (_body, req) => {
      const params = new URL(req.url).searchParams

      const repositoryId = not_typesafe_nonNullAssertion(params.get('repositoryId'))
      const query = not_typesafe_nonNullAssertion(params.get('q'))
      const memexNumber = params.get('memexNumber')

      const {issuesAndPulls} = await this.searchRepositoryItems(
        parseInt(repositoryId, 10),
        query,
        memexNumber ? parseInt(memexNumber, 10) : undefined,
        true,
        false,
      )

      return {count: issuesAndPulls.length}
    }),
  ]
}
