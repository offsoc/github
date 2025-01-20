import type {
  PullRequestPickerPullRequest$data,
  PullRequestState,
} from '../components/__generated__/PullRequestPickerPullRequest.graphql'

interface BuildPullRequests {
  id: string
  isDraft?: boolean
  isInMergeQueue?: boolean
  number: number
  state: PullRequestState
  title: string
  createdAt?: string
}

export function buildPullRequest({
  id,
  isDraft = false,
  isInMergeQueue = false,
  number,
  state,
  title,
  createdAt = '2023-10-16T07:19:52Z',
}: BuildPullRequests): PullRequestPickerPullRequest$data {
  return {
    id,
    __typename: 'PullRequest',
    isDraft,
    isInMergeQueue,
    number,
    state,
    title,
    createdAt,
    url: ``,
    ' $fragmentType': 'PullRequestPickerPullRequest',
    repository: {
      id: 'repoId',
      name: 'repo name',
      nameWithOwner: 'owner repo name',
      owner: {
        __typename: 'typename',
        login: 'org login',
      },
    },
  }
}
