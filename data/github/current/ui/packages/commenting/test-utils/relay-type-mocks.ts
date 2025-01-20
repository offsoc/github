import type {MockResolverContext} from 'relay-test-utils/lib/RelayMockPayloadGenerator'

export function makeIssueCommentBaseTypes() {
  return {
    ID(context: MockResolverContext, generateId: () => number) {
      if (context.name === 'id') {
        return `${context.parentType}${generateId()}`
      }
    },
    DateTime() {
      return '2021-01-01T00:00:00Z'
    },
    String(context: MockResolverContext) {
      if (context.name === 'color') {
        return 'ff0000'
      }
      if (context.name === 'createdAt') {
        return '2021-01-01T00:00:00Z'
      }
      if (context.name === 'minimizedReason' || context.name === 'pendingMinimizeReason') {
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
        // eslint-disable-next-line github/unescaped-html-literal
        return `<p>This is a comment ${generateId()}</p>`
      }
    },
    Boolean(context: MockResolverContext) {
      if (context.name === 'viewerCanUpdate') {
        return true
      }
      if (context.name === 'locked' || context.name === 'viewerHasReacted') {
        return false
      }
      if (context.parentType === 'IssueComment') {
        switch (context.name) {
          case 'isMinimized':
          case 'createdViaEmail':
          case 'isHidden':
            return false
        }
      }
    },
  }
}
