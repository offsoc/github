export function buildViewerIssuesTypes() {
  return {
    suggestedIssueTypeNames: ['Bug', 'Enhancement', 'private', 'Task', 'test'],
  }
}

export function buildProjectIssuesTypes() {
  return {
    projectV2: {
      suggestedIssueTypeNames: ['Batch', 'Epic', 'Must-have', 'Nice-to-have', 'Stretch'],
    },
  }
}

export function buildRepositoryWithIssueTypes({name, owner}: {name: string; owner: string}) {
  return {
    id: 'R-123d2',
    name,
    owner: {
      login: owner,
    },
    isPrivate: false,
    isArchived: false,
    __typename: 'Repository',
    issueTypes: {
      edges: [
        {
          node: {
            name: 'Bug',
            id: 'IT_13d3',
          },
        },
        {
          node: {
            name: 'Feature',
            id: 'IT_asdf1',
          },
        },
      ],
    },
  }
}
