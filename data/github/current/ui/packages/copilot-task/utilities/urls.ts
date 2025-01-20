/**
 * Prefer useLocation() react routing hooks.
 * Rendertime tracking gets lost when using window.location directly.
 */

/**
 * URL path for the app. Gets appended to a pull request URL.
 */
export const EDITOR_PATH = 'edit'

export function baseUrl({owner, repo, pullNumber}: {owner: string; repo: string; pullNumber: string}) {
  return `/${owner}/${repo}/pull/${pullNumber}`
}

export function baseEditUrl({owner, repo, pullNumber}: {owner: string; repo: string; pullNumber: string}) {
  return `${baseUrl({owner, repo, pullNumber})}/${EDITOR_PATH}`
}

export function overviewUrl({
  owner,
  repo,
  pullNumber,
  location,
}: {
  owner: string
  repo: string
  pullNumber: string
  location?: {search: string}
}) {
  const url = baseEditUrl({owner, repo, pullNumber})
  return url + (location?.search || '')
}

export function fileUrl({
  owner,
  repo,
  pullNumber,
  path,
  location,
}: {
  owner: string
  repo: string
  pullNumber: string
  path: string
  location?: {search: string}
}) {
  const url = `${baseEditUrl({owner, repo, pullNumber})}/file/${path}`
  return url + (location?.search || '')
}

export function lightweightFileUrl({
  owner,
  repo,
  pullNumber,
  path,
  location,
}: {
  owner: string
  repo: string
  pullNumber: string
  path: string
  location?: {search: string}
}) {
  const url = `${baseUrl({owner, repo, pullNumber})}/task/files/${path}`
  return url + (location?.search || '')
}

export function newFileUrl({
  owner,
  repo,
  pullNumber,
  location,
}: {
  owner: string
  repo: string
  pullNumber: string
  location?: {search: string}
}) {
  const url = `${baseEditUrl({owner, repo, pullNumber})}/new`
  return url + (location?.search || '')
}

export function commitChangesUrl({owner, repo, pullNumber}: {owner: string; repo: string; pullNumber: string}) {
  return `${baseEditUrl({owner, repo, pullNumber})}/commit_changes`
}
