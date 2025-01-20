import type {DocsetRepo, RepoData, SourceRepo} from '@github-ui/copilot-chat/utils/copilot-chat-types'

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

export function makeSourceRepos(docsetRepos: Array<Pick<DocsetRepo, 'databaseId' | 'owner' | 'paths'>>): SourceRepo[] {
  return docsetRepos.map(repo => ({
    id: repo.databaseId as number,
    ownerID: repo.owner.databaseId as number,
    paths: repo.paths,
  }))
}

export function reconstructDocsetRepos(scopingQuery: string, repos: RepoData[]): DocsetRepo[] {
  const repoPaths = extractRepoPaths(scopingQuery)
  const docsetRepos: DocsetRepo[] = []
  for (const repo of repos) {
    const paths = repoPaths[repo.nameWithOwner]
    if (!paths) {
      continue
    }

    docsetRepos.push({...repo, paths})
  }

  return docsetRepos
}

function extractRepoPaths(scopingQuery: string): RepoPaths {
  // split by repo: qualifier
  const queries = scopingQuery
    .replace(/[)]? OR [(]?/g, ' ')
    .split(/[\s*|(|)]?repo:/)
    .filter(q => !!q)

  const repoNodes: {[key: string]: string[]} = {}

  for (const query of queries) {
    // extract individual qualifier [repo:, path:] from query
    // repo:(?<nwo>\S+) captures the repo name from the `repo:` qualifier and assign to group 'nwo'
    // path:(?<path>.\S+[^)]) captures the path from the `path:` qualifier (excluding ')') and assign to group 'path'
    const matches = query.matchAll(/(^(?<nwo>\S+)|path:(?<path>.\S+[^)]))\s*/gi)
    const [repoNode, ...pathNodes] = Array.from(matches).map(m => m.groups)
    if (!repoNode || !repoNode.nwo) continue
    const repoPaths = pathNodes.filter(node => node?.path).map(node => node?.path?.trim() as string)
    repoNodes[repoNode.nwo] = repoPaths
  }

  return repoNodes
}

type RepoPaths = {[key: string]: string[]}
