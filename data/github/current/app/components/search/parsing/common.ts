// important to import type so we don't bring in all the code
import type {BaseNode, ContentNode, QualifierNode, NodeWithChildren} from '@github/blackbird-parser'

export const enum CaretPositionKind {
  Is,
  Repository,
  Owner,
  Language,
  Path,
  Regex,
  Text,
  Saved,
  OtherQualifier,
}

export function isQualifier(node: BaseNode): node is QualifierNode {
  return !!(node as QualifierNode).qualifier
}

export function isSavedQualifier(node: BaseNode): node is QualifierNode {
  return !!isQualifier(node) && node.qualifier === 'Saved'
}

const slashRegex = new RegExp('\\/', 'g')

export function shouldRedirectInsteadOfSearch(node: BaseNode, path: string): string | null {
  // If the entire user's query is `repo:a/b`, it doesn't make sense to search
  // within the repository with no actual query. They probably want to navigate to
  // the repository itself, so let's just direct them there instead.
  if (isQualifier(node) && isContentNode(node.content)) {
    if (node.qualifier === 'Repo') {
      // Only redirect if it looks like a repository, i.e. contains exactly one slash
      if ([...node.content.value.toString().matchAll(slashRegex)].length !== 1) {
        return null
      }
    } else if (node.qualifier === 'Org') {
      // Only redirect if it looks like an organization, i.e. contains exactly zero slashes
      if ([...node.content.value.toString().matchAll(slashRegex)].length !== 0) {
        return null
      }
    } else {
      // Don't do this redirect behaviour for any other qualifier type
      return null
    }

    // Disallow redirects to repositories or organizations that begin with a /, since
    // that would form an absolute URL!
    if (node.content.value.toString().startsWith('/')) {
      return null
    }

    const redirectURL = `/${node.content.value.toString().split('/').map(encodeURIComponent).join('/')}`

    // If the redirect would take them to the path they're already on, then it's pointless, so
    // just do a search instead.
    if (redirectURL === path) {
      return null
    }

    return redirectURL
  }

  return null
}

// this function is unfortunately duplicated from @github/blackbird-parser so that the code that
// uses it doesn't import that whole huge module
export function isContentNode(node: BaseNode): node is ContentNode {
  return (node as ContentNode).value !== undefined
}

export function hasChildren(node: BaseNode): node is NodeWithChildren {
  return !!(node as NodeWithChildren).children
}

export function containsQualifier(node: BaseNode, qualifierKind: string): boolean {
  if (isQualifier(node) && node.qualifier === qualifierKind) {
    return true
  }

  if (hasChildren(node)) {
    for (const child of node.children) {
      if (containsQualifier(child, qualifierKind)) {
        return true
      }
    }
  }
  return false
}

// Extract all of the text nodes from the AST, ignoring qualifiers. For example,
// the query `lang:typescript repo:github/atom asdf` would return `['asdf']`.
export function extractTextQuery(node: BaseNode): string {
  if (hasChildren(node)) {
    return node.children
      .map(extractTextQuery)
      .filter(x => x.length > 0)
      .join(' ')
  }

  if (isQualifier(node) || node.kind === 'Regex') {
    return ''
  }

  if (isContentNode(node)) {
    return node.value.toString()
  }

  return ''
}

interface RepoOrgScope {
  kind: 'repo' | 'org' | 'saved'
  value: string
}

// Extract all repo and orgs mentioned in the query
export function extractRepoOrgScopes(node: BaseNode): RepoOrgScope[] {
  if (node.kind === 'Not') {
    return []
  }

  if (hasChildren(node)) {
    return node.children.map(extractRepoOrgScopes).flat()
  }

  if (isQualifier(node)) {
    if (node.qualifier === 'Repo' && isContentNode(node.content)) {
      return [{kind: 'repo', value: node.content.value.toString()}]
    } else if (node.qualifier === 'Org' && isContentNode(node.content)) {
      return [{kind: 'org', value: node.content.value.toString()}]
    } else if (isSavedQualifier(node) && isContentNode(node.content)) {
      return [{kind: 'saved', value: node.content.value.toString()}]
    }
  }
  return []
}

export function restrictToScopedOrgs(node: BaseNode, orgs: string[]): string[] {
  const repoOrgScopes = new Set(
    extractRepoOrgScopes(node)
      .map(scope => {
        if (scope.kind === 'org') {
          return scope.value
        } else if (scope.kind === 'repo' && scope.value.includes('/')) {
          return scope.value.split('/')[0]
        } else {
          return null
        }
      })
      .filter(s => s !== null)
      .map(s => s?.toLowerCase()),
  )

  if (repoOrgScopes.size === 0) {
    return orgs
  }

  return orgs.filter(org => repoOrgScopes.has(org.toLowerCase()))
}
