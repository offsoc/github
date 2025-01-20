export const URLS = {
  queryParams: {
    org: 'org',
    repo: 'repo',
    template: 'template',
    title: 'title',
    body: 'body',
    assignees: 'assignees',
    labels: 'labels',
    milestone: 'milestone',
    projects: 'projects',
    type: 'type',
  },
  maxQueryLengthLimits: {
    title: 256,
    body: 65536,
    assignees: 10,
    labels: 20,
    projects: 20,
  },
}

export const reservedQueryKeys = Object.values(URLS.queryParams)
