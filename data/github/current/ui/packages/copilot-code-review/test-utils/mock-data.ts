import type {PullRequestPathParams} from '../types'

export const getPullRequestPathParams = (): PullRequestPathParams => ({
  owner: 'github',
  repository: 'testing',
  number: 1,
})
