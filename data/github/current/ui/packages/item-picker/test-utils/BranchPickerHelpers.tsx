import type {BranchPickerRef$data} from '../components/__generated__/BranchPickerRef.graphql'

interface BuildBranches {
  id: string
  name: string
  pullRequestsCount?: number
}

export function buildBranch({id, name, pullRequestsCount = 0}: BuildBranches): BranchPickerRef$data {
  return {
    id,
    __typename: 'Ref',
    name,
    repository: {
      defaultBranchRef: {
        id: 'defaultBranchId',
        name: 'defaultBranchName',
        target: {
          oid: 'defaultBranchTargetOid',
          id: 'defaultBranchTargetId',
          __typename: 'typename',
        },
        associatedPullRequests: {
          totalCount: 1,
        },
        repository: {
          id: 'repoId',
        },
      },
      id: 'repoId',
      nameWithOwner: 'owner/repo',
    },
    target: {
      oid: 'targetOid',
      id: 'targetId',
      __typename: 'typename',
    },
    associatedPullRequests: {
      totalCount: pullRequestsCount,
    },
    ' $fragmentType': 'BranchPickerRef',
  }
}
