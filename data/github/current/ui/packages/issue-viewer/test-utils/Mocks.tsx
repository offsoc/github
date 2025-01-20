import type {MockResolverContext} from 'relay-test-utils/lib/RelayMockPayloadGenerator'

export function makeIssueBaseFields() {
  return {
    DateTime() {
      return '2021-01-01T00:00:00Z'
    },
    String(context: MockResolverContext) {
      if (context.parentType === 'Issue' && context.name === 'title') {
        return 'Issue title'
      }
      if (context.parentType === 'Project' && context.name === 'name') {
        return 'project name'
      }
      if (context.name === 'color') {
        return 'ff0000'
      }
      if (context.name === 'createdAt') {
        return '2021-01-01T00:00:00Z'
      }
      if (context.name === 'enterpriseManagedEnterpriseId') {
        return null
      }
    },
    URI(context: MockResolverContext) {
      if (context.name === 'avatarUrl') {
        return 'https://avatars.githubusercontent.com/u/9919?v=4&size=48'
      }
    },
    HTML(context: MockResolverContext, generateId: () => number) {
      if (context.name === 'titleHTML') {
        return 'Issue title'
      }
      if (context.parentType === 'Issue' && context.name === 'bodyHTML') {
        return `Body ${generateId()}`
      }
      if (context.parentType === 'IssueComment' && context.name === 'bodyHTML') {
        return `comment body ${generateId()}`
      }
    },
    Int(context: MockResolverContext) {
      if (context.parentType === 'Issue' && context.name === 'number') {
        return 1234
      }
    },
  }
}
