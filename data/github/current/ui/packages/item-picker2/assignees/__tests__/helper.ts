export const MockUser = (index: number) => {
  return {
    id: `assignee-${index}`,
    name: `assignee ${index}`,
    login: `assignee ${index}`,
    avatarUrl: `https://avatars.githubusercontent.com/u/${index + 1}?size=64`,
  }
}

export const MockCurrentViewer = {
  id: 'viewer-id',
  login: 'viewer',
  name: 'viewer name',
  avatarUrl: 'https://avatars.githubusercontent.com/u/92997159?size=64',
}

export const mockAssigneesResolvers = (itemsCount: number = 4, selectedCount: number = 1) => ({
  Query() {
    return {
      viewer: MockCurrentViewer,
    }
  },
  Repository() {
    return {
      issue: {
        assignees: {
          nodes: Array.from({length: selectedCount}, (_, index) => MockUser(index)),
        },
      },
      issueOrPullRequest: {
        suggestedAssignees: {
          edges: Array.from({length: itemsCount}, (_, index) => MockUser(index))
            .concat(MockCurrentViewer)
            .map(node => ({node})),
        },
      },
    }
  },
})
