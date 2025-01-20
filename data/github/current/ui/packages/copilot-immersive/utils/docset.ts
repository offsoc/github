import type {AndNode, FinalNode, GroupNode, OrNode, QualifierNode} from '@github/blackbird-parser'
import {parse} from '@github/blackbird-parser'
import type {DocsetRepo, RepoData} from '@github-ui/copilot-chat/utils/copilot-chat-types'

/**
 * Given a list of objects containing repo and path data, generates a blackbird query
 * which will return only code matching the specified paths in those repos.
 */
export function makeScopingQuery(repos: Array<Pick<DocsetRepo, 'nameWithOwner' | 'paths'>>): string {
  return repos
    .map(repo => {
      const repoQualifier = `repo:${repo.nameWithOwner}`
      if (repo.paths.length === 0) {
        return repoQualifier
      } else {
        let pathQualifiers = repo.paths.map(path => `path:${path}`).join(' OR ')
        if (repo.paths.length > 1) {
          pathQualifiers = `(${pathQualifiers})`
        }
        return `(${repoQualifier} ${pathQualifiers})`
      }
    })
    .join(' OR ')
}

export function reconstructDocsetRepos(scopingQuery: string, repos: RepoData[]): DocsetRepo[] {
  return extractDocsetReposFromNode(parse(scopingQuery), repos)
}

/**
 * Given a node representing the entirety of one of the queries generated above and a
 * list of objects containing repo data, returns a list of the repos included in the
 * query, augmented with the list of paths specified for each repo.
 */
function extractDocsetReposFromNode(node: FinalNode, repos: RepoData[]): DocsetRepo[] {
  if (node.kind === 'Or') {
    let docsetRepos: DocsetRepo[] = []
    for (const child of node.children) {
      docsetRepos = docsetRepos.concat(extractDocsetReposFromNode(child, repos))
    }
    return docsetRepos
  }

  if (node.kind === 'Qualifier' && node.qualifier === 'Repo') {
    const repoNode = node.content as FinalNode // I think this is a bug in the parser - node.content returns BaseNode here, which does not narrow on .kind
    if (repoNode.kind !== 'Text') return []

    const nwo = repoNode.value
    const matchingRepo = repos.find(r => r.nameWithOwner === nwo)
    if (!matchingRepo) return []

    return [{...matchingRepo, paths: []}]
  }

  if (node.kind === 'Group') {
    const repoQualifierNode = extractUniqueRepoQualifier(node)
    if (!repoQualifierNode) return []

    const docsetRepoWithoutPaths = extractDocsetReposFromNode(repoQualifierNode, repos)[0]
    if (!docsetRepoWithoutPaths) return []

    const pathQualifierNodes = extractPathQualifiers(node)
    const paths = pathQualifierNodes
      .map(q => {
        const textNode = q.content as FinalNode
        if (textNode.kind !== 'Regex' && textNode.kind !== 'Text') return null
        return textNode.value
      })
      .filter(v => !!v) as string[]

    return [{...docsetRepoWithoutPaths, paths}]
  }

  return []
}

/**
 * Given a node representing a segment of a query like:
 *
 * - `(repo:foo/bar path:/my/path)`
 * - `(repo:foo/bar (path:/my/path OR path:/my/other/path))`
 *
 * Returns a single repo qualifier node. Based on the structure of the queries we
 * generate, there should be exactly one of these. If there is more than one, we return
 * the first one in order to have some result rather than no result. If there are none,
 * we return null.
 */
function extractUniqueRepoQualifier(node: GroupNode | AndNode): QualifierNode | null {
  for (const child of node.children) {
    if (child.kind === 'Qualifier' && child.qualifier === 'Repo' && child.content.kind === 'Text') return child

    if (child.kind === 'Group' || child.kind === 'And') {
      const maybeRepoQualifier = extractUniqueRepoQualifier(child)
      if (maybeRepoQualifier) return maybeRepoQualifier
    }
  }
  return null
}

/**
 * Given a node representing a segment of a query like:
 *
 * - `(repo:foo/bar path:/my/path)`
 * - `(repo:foo/bar (path:/my/path OR path:/my/other/path))`
 *
 * Returns an array of path qualifier nodes. Based on the structure of the queries we
 * generate, these will all be ORed together.
 */
function extractPathQualifiers(node: GroupNode | AndNode): QualifierNode[] {
  // At the top level of an AND or group, we have either a single path or an ORed list of paths.
  const topLevelPathQualifier = node.children.find(
    c => c.kind === 'Qualifier' && c.qualifier === 'Path',
  ) as QualifierNode

  if (topLevelPathQualifier) return [topLevelPathQualifier]

  const topLevelOr = node.children.find(c => c.kind === 'Or') as OrNode
  if (topLevelOr) {
    return topLevelOr.children.filter(c => c.kind === 'Qualifier' && c.qualifier === 'Path') as QualifierNode[]
  }

  for (const child of node.children) {
    if (child.kind === 'Group' || child.kind === 'And') {
      const maybePathQualifiers = extractPathQualifiers(child)
      if (maybePathQualifiers.length > 0) return maybePathQualifiers
    }
  }

  return []
}
