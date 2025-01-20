let i = 0
export function createId() {
  return (i++).toString()
}

export const MockPullRequest = (index: number) => {
  return {
    id: createId(),
    title: `selected pull request ${index}`,
    __typename: 'PullRequest' as const,
  }
}

export const MockBranch = (index: number) => {
  return {
    id: createId(),
    title: `selected branch ${index}`,
    __typename: 'Ref' as const,
  }
}

export function mockPullRequestsAndBranchesResolvers(
  pullRequestsCount: number = 4,
  branchesCount: number = 4,
  selectedPullRequestsCount: number = 1,
  selectedBranchesCount: number = 1,
) {
  return {
    Issue() {
      return {
        linkedPullRequests: {
          nodes: Array.from({length: selectedPullRequestsCount}, (_, index) => MockPullRequest(index)),
        },
        linkedBranches: {
          nodes: Array.from({length: selectedBranchesCount}, (_, index) => ({ref: MockBranch(index)})),
        },
      }
    },
    Repository() {
      return {
        pullRequests: {
          nodes: Array.from({length: pullRequestsCount}, (_, index) => {
            return {
              id: createId(),
              title: `pull request ${index}`,
              __typename: 'PullRequest' as const,
            }
          }),
        },
        refs: {
          edges: Array.from({length: branchesCount}, (_, index) => {
            return {
              node: {
                id: createId(),
                title: `branch ${index}`,
                __typename: 'Ref' as const,
              },
            }
          }),
        },
      }
    },
  }
}
