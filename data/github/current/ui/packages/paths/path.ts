import {ssrSafeLocation} from '@github-ui/ssr-utils'
import type {PathFunction} from './types'
import {encodePart} from './utils'

type Repository = {
  name: string
  ownerLogin: string
}

type ActivityFilter = {
  actor?: {
    login: string
  }
  activityType: string
  timePeriod: string
  sort: string
}

export type RepositoryTreePathAction =
  | 'tree'
  | 'blob'
  | 'blame'
  | 'raw'
  | 'new'
  | 'edit'
  | 'delete'
  | 'upload'
  | 'tree/delete'
  | 'latest-commit'
  | 'tree-commit-info'
  | 'branch-infobar'
  | 'file-contributors'
  | 'overview-files'

export type RepositoryPathAction =
  | 'hovercard'
  | 'refs'
  | 'actions'
  | 'pulls'
  | 'issues'
  | 'issues/new'
  | 'branches'
  | 'tags'
  | 'settings'

export const fullUrl: PathFunction<{path: string}> = ({path}) => new URL(path, ssrSafeLocation.origin).toString()

export const codeNavGeneralSearchPath: PathFunction<{searchTerm: string}> = ({searchTerm}) =>
  `/search?q=${encodePart(`${searchTerm}`)}&type=code`

export const codeNavSearchPath: PathFunction<{owner: string; repo: string; searchTerm: string}> = ({
  owner,
  repo,
  searchTerm,
}) => `/search?q=${encodePart(`repo:${owner}/${repo} ${searchTerm}`)}&type=code`

export const searchPath: PathFunction = () => `/search`

export const advancedSearchPath = () => `/search/advanced`

export const searchStatsPath: PathFunction = () => `/search/stats`

export const ownerPath: PathFunction<{owner: string}> = ({owner}) => `/${encodePart(owner)}`

export const ownerAvatarPath: PathFunction<{owner: string}> = ({owner}) => `/${encodePart(owner)}.png`

export const userHovercardPath: PathFunction<{owner: string}> = ({owner}) => `/users/${encodePart(owner)}/hovercard`

export const teamHovercardPath: PathFunction<{owner: string; team: string}> = ({owner, team}) =>
  `/orgs/${encodePart(owner)}/teams/${encodePart(team)}/hovercard`

export const orgHovercardPath: PathFunction<{owner: string}> = ({owner}) => `/orgs/${encodePart(owner)}/hovercard`

export const userIdHovercardPath: PathFunction<{userId: number}> = ({userId}) => `/hovercards?user_id=${userId}`

export function repositoryPath({owner, repo, action}: {owner: string; repo: string; action?: RepositoryPathAction}) {
  return action ? `/${encodePart(owner)}/${encodePart(repo)}/${action}` : `/${encodePart(owner)}/${encodePart(repo)}`
}

export const repositoryStatsPath: PathFunction<{owner: string; repo: string}> = ({owner, repo}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/stats`

export const repositoryParticipationPath: PathFunction<{owner: string; repo: string}> = ({owner, repo}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/graphs/participation`

export const repoCommitActivityInsightsPath: PathFunction<{owner: string; repo: string}> = ({owner, repo}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/graphs/commit-activity`

export const refNameCheckPath: PathFunction<{owner: string; repo: string; refName: string}> = ({
  owner,
  repo,
  refName,
}) => `/${encodePart(owner)}/${encodePart(repo)}/branches/${encodePart(refName)}/rename_ref_check`

export const renameBranchEffectsPath: PathFunction<{owner: string; repo: string; branchName: string}> = ({
  owner,
  repo,
  branchName,
}) => `/${encodePart(owner)}/${encodePart(repo)}/branches/rename_form/${encodePart(branchName)}`

export const renameRefPath: PathFunction<{owner: string; repo: string; refName: string}> = ({owner, repo, refName}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/branches/${encodePart(refName)}`

export const checkTagNameExistsPath: PathFunction<{owner: string; repo: string}> = ({owner, repo}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/branches/check_tag_name_exists`

export const branchPath: PathFunction<{owner: string; repo: string; branch: string}> = ({owner, repo, branch}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/tree/${encodePart(branch)}`

export const tagPath: PathFunction<{owner: string; repo: string; tag: string}> = ({owner, repo, tag}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/releases/tag/${encodePart(tag)}`

export const invitationsPath: PathFunction<{owner: string; repo: string}> = ({owner, repo}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/invitations`

export const migrateImmutableActionsPath: PathFunction<{owner: string; repo: string}> = ({owner, repo}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/actions/immutable_actions/migrate`

export const migrationWorkflowsPath: PathFunction<{owner: string; repo: string}> = ({owner, repo}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/actions/workflows/immutable-actions-migration/migrate_release`

export const newBranchProtectionPath: PathFunction<{owner: string; repo: string; branchName: string}> = ({
  owner,
  repo,
  branchName,
}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/settings/branch_protection_rules/new?branch_name=${encodePart(branchName)}`

export const rulesetsPath: PathFunction<{owner: string; repo: string}> = ({owner, repo}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/settings/rules`

export const newRulesetPath: PathFunction<{owner: string; repo: string}> = ({owner, repo}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/settings/rules/new?target=branch&enforcement=disabled`

export const orgRulesetsTargetCountPath: PathFunction<{owner: string}> = ({owner}) =>
  `/organizations/${encodePart(owner)}/settings/rules/deferred_target_counts`

export const stafftoolsOrgRulesetsTargetCountPath: PathFunction<{owner: string}> = ({owner}) =>
  `/stafftools/users/${encodePart(owner)}/organization_rules/deferred_target_counts`

export const repoRulesetsTargetCountPath: PathFunction<{owner: string; repo: string}> = ({owner, repo}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/settings/rules/deferred_target_counts`

export const stafftoolsRepoRulesetsTargetCountPath: PathFunction<{owner: string; repo: string}> = ({owner, repo}) =>
  `/stafftools/repositories/${encodePart(owner)}/${encodePart(repo)}/repository_rules/deferred_target_counts`

export const validateRegexPath = () => '/repos/validate_regex'
export const validateRegexValuePath = () => '/repos/validate_regex/value'

export const blobPath: PathFunction<{
  owner: string
  repo: string
  commitish: string
  filePath: string
  lineNumber?: number
  plain?: number
}> = ({owner, repo, commitish, filePath, lineNumber, plain}) => {
  const params = plain ? `?plain=${plain}` : ''
  const suffix = lineNumber ? `#L${lineNumber}` : ''
  return `/${encodePart(owner)}/${encodePart(repo)}/blob/${encodePart(commitish)}/${encodePart(
    filePath,
  )}${params}${suffix}`
}

export const editBlobPath: PathFunction<{
  owner: string
  repo: string
  commitish: string
  filePath: string
  hash?: string
  lineNumber?: number
  plain?: number
}> = ({owner, repo, commitish, filePath, hash, lineNumber}) => {
  const suffix = hash ? hash : lineNumber ? `#L${lineNumber}` : ''
  return `/${encodePart(owner)}/${encodePart(repo)}/edit/${encodePart(commitish)}/${encodePart(filePath)}${suffix}`
}

export const blamePath: PathFunction<{
  owner: string
  repo: string
  commitish: string
  filePath: string
  lineNumber?: number
}> = ({owner, repo, commitish, filePath, lineNumber}) => {
  const suffix = lineNumber ? `#L${lineNumber}` : ''
  return `/${encodePart(owner)}/${encodePart(repo)}/blame/${encodePart(commitish)}/${encodePart(filePath)}${suffix}`
}

export function dismissRepositoryNoticePathPath({login}: {login: string}) {
  return `/users/${encodePart(login)}/dismiss_repository_notice`
}

export function deferredMetadataPath({repo, commitish, path}: {repo: Repository; commitish: string; path: string}) {
  const parts = ['', repo.ownerLogin, repo.name, 'deferred-metadata', commitish, path]
  return parts.map(encodePart).join('/')
}

export function deferredASTPath({repo, commitish, path}: {repo: Repository; commitish: string; path: string}) {
  const parts = ['', repo.ownerLogin, repo.name, 'deferred-ast', commitish, path]
  return parts.map(encodePart).join('/')
}

export function repoOverviewUrl(repo: Pick<Repository, 'name' | 'ownerLogin'>) {
  return `/${encodePart(repo.ownerLogin)}/${encodePart(repo.name)}`
}

export function repoDefaultBrachUrl(repo: Repository) {
  return `/${encodePart(repo.ownerLogin)}/${encodePart(repo.name)}?files=1`
}

export function repositoryTreePath({
  repo,
  commitish,
  action,
  path,
}: {
  repo: Pick<Repository, 'name' | 'ownerLogin'>
  commitish: string
  action: RepositoryTreePathAction
  path?: string
}) {
  const parts = ['', repo.ownerLogin, repo.name, action, commitish]

  if (path && path !== '/') {
    parts.push(path)
  }

  return parts.map(encodePart).join('/')
}

export const blobSidePanelMetadataPath: PathFunction<{
  owner: string
  repo: string
}> = ({owner, repo}) => `/${owner}/${repo}/sidepanel-metadata`

export function blobDetectLanguage(repo: Repository, encodedFileName: string, fullDetails?: boolean) {
  return `/${repo.ownerLogin}/${repo.name}/detect_language?filename=${encodedFileName}${
    fullDetails ? '&full_details=true' : ''
  }`
}

export const wikiBlobBasePath: PathFunction<{owner: string; repo: string; filePath: string}> = ({
  owner,
  repo,
  filePath,
}) => `/${encodePart(owner)}/${encodePart(repo)}/wiki/${filePath.substring(0, filePath.lastIndexOf('.'))}`

export const wikiBlobPath: PathFunction<{owner: string; repo: string; filePath: string; commitish: string}> = ({
  owner,
  repo,
  filePath,
  commitish,
}) => `${wikiBlobBasePath({owner, repo, filePath})}/${commitish}`

export const wikiComparePath: PathFunction<{owner: string; repo: string; commitish: string}> = ({
  owner,
  repo,
  commitish,
}) => `/${encodePart(owner)}/${encodePart(repo)}/wiki/_compare/${commitish}`

export const commitPath: PathFunction<{owner: string; repo: string; commitish: string}> = ({owner, repo, commitish}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/commit/${commitish}`

export const diffLinesPath: PathFunction<{owner: string; repo: string; sha1: string; sha2: string; entry: string}> = ({
  owner,
  repo,
  entry,
  sha1,
  sha2,
}) => `/${encodePart(owner)}/${encodePart(repo)}/diffs/${entry}/diff-lines?sha1=${sha1}&sha2=${sha2}`

export const commitDiffEntriesPath: PathFunction<{owner: string; repo: string; commitish: string}> = ({
  owner,
  repo,
  commitish,
}) => `${commitPath({owner, repo, commitish})}/remaining_diff_entries`

export const commitContextLinesPath: PathFunction<{owner: string; repo: string; commitish: string}> = ({
  owner,
  repo,
  commitish,
}) => `${commitPath({owner, repo, commitish})}/context_lines`

export const commitDiscussionsPath: PathFunction<{
  owner: string
  repo: string
  commitOid: string
  beforeCommentId?: string
}> = ({owner, repo, commitOid, beforeCommentId}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/commit/${commitOid}/discussion_comments${
    beforeCommentId ? `?before_comment_id=${beforeCommentId}` : ''
  }`

export const commitInlineCommentsPath: PathFunction<{
  owner: string
  repo: string
  commitOid: string
  path: string
  position: string
}> = ({owner, repo, commitOid, path, position}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/commit/${commitOid}/inline_comments/?path=${encodePart(
    path,
  )}&position=${encodePart(position)}`

export const commitCommentDeferredCommentDataPath: PathFunction<{
  owner: string
  repo: string
  commitOid: string
}> = ({owner, repo, commitOid}) => `/${encodePart(owner)}/${encodePart(repo)}/commit/${commitOid}/deferred_comment_data`

export const commitsPath: PathFunction<{owner: string; repo: string; ref?: string; path?: string}> = ({
  owner,
  repo,
  ref,
  path,
}) => {
  const base = `/${encodePart(owner)}/${encodePart(repo)}/commits`
  if (!ref) return base
  if (!path) return `${base}/${encodePart(ref)}`
  return `${base}/${encodePart(ref)}/${encodePart(stripLeadingSlash(path))}`
}

export function commitsPathByAuthor({
  repo,
  branch,
  path,
  author,
}: {
  repo: Repository
  branch: string
  path: string
  author: string
}) {
  const url = [repo.ownerLogin, repo.name, 'commits', branch, path].map(encodePart).join('/')
  return `/${url}?author=${encodePart(author)}`
}

export function commitStatusDetailsPath(repo: Repository, oid: string) {
  return `/${repo.ownerLogin}/${repo.name}/commit/${oid}/status-details`
}

export function commitsByAuthor({repo, author}: {repo: Repository; author: string}) {
  const parts = [repo.ownerLogin, repo.name]

  return `/${parts.map(encodePart).join('/')}/commits?author=${encodePart(author)}`
}

export const commitHovercardPath: PathFunction<{owner: string; repo: string; commitish: string}> = ({
  owner,
  repo,
  commitish,
}) => `/${encodePart(`${owner}/${repo}/commit/${commitish}/hovercard`)}`

export const branchCommmitsPath: PathFunction<{owner: string; repo: string; commitish: string}> = ({
  owner,
  repo,
  commitish,
}) => `/${encodePart(`${owner}/${repo}/branch_commits/${commitish}`)}`

export const topicPath: PathFunction<{topicName: string}> = ({topicName}) => `/topics/${topicName}`

export const marketplaceCategoryPath: PathFunction<{categoryName: string}> = ({categoryName}) =>
  `/marketplace/category/${parametrize(categoryName)}`

export const marketplaceActionPath: PathFunction<{slug: string}> = ({slug}) =>
  `/marketplace/actions/${encodePart(slug)}`

export const actionsWorkflowRunPath: PathFunction<{owner: string; repo: string; runId?: string; attempt?: string}> = ({
  owner,
  repo,
  runId,
  attempt,
}) => {
  const parts = [owner, repo, 'actions']
  if (runId) {
    parts.push('runs', runId)
  }
  // Attempt defaults to '1' when not set
  if (runId && attempt) {
    parts.push('attempts', attempt)
  }

  return `/${parts.map(encodePart).join('/')}`
}

export const actionsWorkflowFilePath: PathFunction<{owner: string; repo: string; runId?: string}> = ({
  owner,
  repo,
  runId,
}) => {
  const parts = [owner, repo, 'actions']
  if (runId) {
    parts.push('runs', runId, 'workflow')
  }
  return `/${parts.map(encodePart).join('/')}`
}

export const codeownersErrorPath: PathFunction<{owner: string; repo: string; commitish: string; filePath: string}> = ({
  owner,
  repo,
  commitish,
  filePath,
}) => `/${owner}/${repo}/codeowners-validity/${commitish}/${filePath}`

function stripLeadingSlash(path: string) {
  return path.startsWith('/') ? path.slice(1) : path
}

/**
 * Replaces all non-alphanumeric characters with dashes, just like string.parametrize in ruby.
 */
function parametrize(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
}

export function parentPath(path: string) {
  return path.split('/').slice(0, -1).join('/')
}

/**
 * Returns the path to the activity index page for a repository.
 *
 * To reuse this path in apps rendered in different places (e.g. GitHub.com vs Stafftools) - pass in the `baseUrl` param.
 */
export function activityIndexPath({
  repo,
  baseUrl = '',
  branch,
  filter,
  pagination,
  perPage = 30,
}: {
  repo: Repository
  baseUrl?: string
  branch?: string
  filter?: ActivityFilter
  pagination?: {before?: string | null; after?: string | null}
  perPage?: number
}) {
  const parts = [repo.ownerLogin, repo.name, 'activity']
  const params = []

  if (branch) params.push(`ref=${encodePart(branch)}`)
  if (filter) {
    // Don't add default values to the path/query-string
    if (filter.activityType && filter.activityType.toLocaleLowerCase() !== 'all') {
      params.push(`activity_type=${encodePart(filter.activityType)}`)
    }

    if (filter.actor?.login) {
      params.push(`actor=${encodePart(filter.actor.login)}`)
    }

    // Don't add default values to the path/query-string
    if (filter.timePeriod && filter.timePeriod.toLocaleLowerCase() !== 'all') {
      params.push(`time_period=${encodePart(filter.timePeriod)}`)
    }

    // Don't add default values to the path/query-string
    if (filter.sort && filter.sort.toLocaleLowerCase() !== 'desc') {
      params.push(`sort=${encodePart(filter.sort)}`)
    }
  }

  if (pagination) {
    if (pagination.after) {
      params.push(`after=${encodePart(pagination.after)}`)
    } else if (pagination.before) {
      params.push(`before=${pagination.before}`)
    }
  }

  // Don't add default values to the path/query-string
  if (perPage && perPage !== 30) {
    params.push(`per_page=${perPage}`)
  }

  return `${baseUrl}/${parts.map(encodePart).join('/')}${params.length > 0 ? `?${params.join('&')}` : ''}`
}

/**
 * Returns the path to the activity actors endpoing for a repository.
 *
 * To reuse this path in apps rendered in different places (e.g. GitHub.com vs Stafftools) - pass in the `baseUrl` param.
 */
export function activityActorsPath({
  repo,
  baseUrl = '',
  branch,
  timePeriod,
}: {
  repo: Repository
  baseUrl?: string
  branch?: string
  timePeriod?: string
}) {
  const parts = [repo.ownerLogin, repo.name, 'activity', 'actors']
  const params = []

  if (branch) params.push(`ref=${encodePart(branch)}`)
  if (timePeriod) params.push(`time_period=${encodePart(timePeriod)}`)

  return `${baseUrl}/${parts.map(encodePart).join('/')}${params.length > 0 ? `?${params.join('&')}` : ''}`
}

export function ruleInsightsActorsPath() {
  return `insights/actors`
}

export function bypassRequestersActorsPath() {
  return `bypass_requests/requesters`
}

export function bypassApproversActorsPath() {
  return `bypass_requests/approvers`
}

export function comparePath({repo, base = undefined, head}: {repo: Repository; base?: string; head: string}) {
  const baseSegment = [repo.ownerLogin, repo.name, 'compare'].map(encodePart).join('/')
  const compareSegment = base ? `${encodePart(base)}...${encodePart(head)}` : encodePart(head)
  return `/${baseSegment}/${compareSegment}`
}

export function mergeabilityCheckPath({repo, base, head}: {repo: Repository; base: string; head: string}) {
  const baseSegment = [repo.ownerLogin, repo.name, 'branches', 'pre_mergeable'].map(encodePart).join('/')
  const compareSegment = `${encodePart(base)}...${encodePart(head)}`
  return `/${baseSegment}/${compareSegment}`
}

export function repoPullRequestsPath(owner: string, repo: string) {
  return `/${encodePart(owner)}/${encodePart(repo)}/pulls`
}

export function repoStargazersPath(owner: string, repo: string) {
  return `/${encodePart(owner)}/${encodePart(repo)}/stargazers`
}

export function newPullRequestPath({repo, refName}: {repo: Repository; refName: string}) {
  return `/${[repo.ownerLogin, repo.name, 'pull', 'new', refName].map(encodePart).join('/')}`
}

export function pullRequestPath({repo, number}: {repo: Repository; number: number}) {
  return `/${[repo.ownerLogin, repo.name, 'pull', number.toString()].map(encodePart).join('/')}`
}

export const pullRequestTitlePath: PathFunction<{
  owner: string
  repo: string
  number: number
}> = ({owner, repo, number}) => `/${encodePart(owner)}/${encodePart(repo)}/pull/${number}`

export const pullRequestBodyPath: PathFunction<{
  owner: string
  repo: string
  number: number
  contentId: number
}> = ({owner, repo, number, contentId}) => `/${encodePart(owner)}/${encodePart(repo)}/pull/${number}#issue-${contentId}`

export const pullRequestCommentPath: PathFunction<{
  owner: string
  repo: string
  number: number
  contentId: number
}> = ({owner, repo, number, contentId}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/pull/${number}#issuecomment-${contentId}`

export const pullRequestReviewPath: PathFunction<{
  owner: string
  repo: string
  number: number
  contentId: number
}> = ({owner, repo, number, contentId}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/pull/${number}#pullrequestreview-${contentId}`

export const pullRequestReviewCommentPath: PathFunction<{
  owner: string
  repo: string
  number: number
  contentId: number
}> = ({owner, repo, number, contentId}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/pull/${number}#discussion_r${contentId}`

export function fetchAndMergePath({repo, refName, discard}: {repo: Repository; refName: string; discard?: boolean}) {
  return `/${[repo.ownerLogin, repo.name, 'branches', 'fetch_and_merge', refName].map(encodePart).join('/')}${
    discard ? '?discard_changes=true' : ''
  }`
}

export function reposSurveyPath(repo: Repository, action?: 'dismiss' | 'answer') {
  const parts = [repo.ownerLogin, repo.name, 'repos', 'survey']
  if (action) parts.push(action)
  return `/${parts.map(encodePart).join('/')}`
}

export function codeNavSurveyPath(ownerLogin: string, repoName: string, action?: 'answer') {
  const parts = [ownerLogin, repoName, 'repos', 'code_nav_survey']
  if (action) parts.push(action)
  return `/${parts.map(encodePart).join('/')}`
}

export function treeListPath({
  repo,
  commitOid,
  includeDirectories = false,
}: {
  repo: Repository
  commitOid: string
  includeDirectories?: boolean
}) {
  const path = `/${[repo.ownerLogin, repo.name, 'tree-list', commitOid].map(encodePart).join('/')}`

  return includeDirectories ? `${path}?include_directories=${includeDirectories}` : path
}

export function branchCountPath(repo: Repository) {
  const parts = [repo.ownerLogin, repo.name, 'branch-count']
  return `/${parts.map(encodePart).join('/')}`
}

export function tagCountPath(repo: Repository) {
  const parts = [repo.ownerLogin, repo.name, 'tag-count']
  return `/${parts.map(encodePart).join('/')}`
}

export function codeNavigationPath({
  repo,
  type,
  q,
  language,
  row,
  column,
  ref,
  path,
  codeNavContext,
  symbolKind,
}: {
  repo: Repository
  type: string
  q: string
  language: string
  row: number
  column: number
  ref: string
  path: string
  codeNavContext: string
  symbolKind: string | null
}) {
  const repoSegment = [repo.ownerLogin, repo.name].map(encodePart).join('/')
  const params = new URLSearchParams()
  params.append('q', q)
  params.append('language', language)
  params.append('row', String(row))
  params.append('col', String(column))
  params.append('ref', ref)
  params.append('blob_path', path)
  params.append('code_nav_context', codeNavContext)
  if (symbolKind) {
    params.append('symbol_kind', symbolKind)
  }
  return `/${repoSegment}/find-react-${type}?${params.toString()}`
}

export const discussionPath: PathFunction<{owner: string; repo: string; discussionNumber: number}> = ({
  owner,
  repo,
  discussionNumber,
}) => `/${encodePart(owner)}/${encodePart(repo)}/discussions/${discussionNumber}`

export const discussionCommentPath: PathFunction<{
  owner: string
  repo: string
  discussionNumber: number
  contentId: number
}> = ({owner, repo, discussionNumber, contentId}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/discussions/${discussionNumber}#discussioncomment-${contentId}`

export const discussionBodyPath: PathFunction<{
  owner: string
  repo: string
  discussionNumber: number
  contentId: number
}> = ({owner, repo, discussionNumber, contentId}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/discussions/${discussionNumber}#discussion-${contentId}`

export function repoIssuesPath(owner: string, repo: string) {
  return `/${encodePart(owner)}/${encodePart(repo)}/issues`
}

export const issuePath: PathFunction<{owner: string; repo: string; issueNumber: number}> = ({
  owner,
  repo,
  issueNumber,
}) => `/${encodePart(owner)}/${encodePart(repo)}/issues/${issueNumber}`

export const issueCommentPath: PathFunction<{owner: string; repo: string; issueNumber: number; contentId: number}> = ({
  owner,
  repo,
  issueNumber,
  contentId,
}) => `/${encodePart(owner)}/${encodePart(repo)}/issues/${issueNumber}#issuecomment-${contentId}`

export const issueBodyPath: PathFunction<{owner: string; repo: string; issueNumber: number; contentId: number}> = ({
  owner,
  repo,
  issueNumber,
  contentId,
}) => `/${encodePart(owner)}/${encodePart(repo)}/issues/${issueNumber}#issue-${contentId}`

export const issueHovercardPath: PathFunction<{owner: string; repo: string; issueNumber: number}> = ({
  owner,
  repo,
  issueNumber,
}) => `/${encodePart(owner)}/${encodePart(repo)}/issues/${issueNumber}/hovercard`

export const issueLinkedPullRequestHovercardPath: PathFunction<{
  owner: string
  repo: string
  pullRequestNumber: number
}> = ({owner, repo, pullRequestNumber}) =>
  `/${encodePart(owner)}/${encodePart(repo)}/pull/${pullRequestNumber}/hovercard`

export const featurePreviews: PathFunction<{login: string}> = ({login}) =>
  `/users/${encodePart(login)}/feature_previews`

export function extractPathFromPathname(pathname: string, refName: string, defaultPath: string) {
  // We expect the pathname to be in the form of /owner/repo/action/branch/path
  // That's why we split the pathname by '/' and take the 4th element (after the action)
  const indexOfBranchAndPath = getIndexOfNth(pathname, '/', 4)
  const branchAndPath = pathname.substring(indexOfBranchAndPath)

  if (branchAndPath === `/${refName}`) {
    // there is no path so there is no trailing slash
    return ''
  } else if (branchAndPath.startsWith(`/${refName}/`)) {
    return branchAndPath.substring(refName.length + 2)
  } else {
    return defaultPath
  }
}

export function codeOfConductPath(owner: string, repo: string) {
  return `/${encodePart(owner)}/${encodePart(repo)}/community/code-of-conduct/new`
}

export function licenseSelectorPath(owner: string, repo: string) {
  return `/${encodePart(owner)}/${encodePart(repo)}/community/license/new`
}

export function securityPolicyPath(owner: string, repo: string) {
  return `/${encodePart(owner)}/${encodePart(repo)}/security/policy`
}

function getIndexOfNth(text: string, subString: string, index: number) {
  return text.split(subString, index).join(subString).length
}

export const repoTransferPath = (repo: Repository) =>
  `/${encodePart(`${repo.ownerLogin}/${repo.name}`)}/settings/transfer`

export const repositoryCheckNamePath = () => '/repositories/check-name'

export const repositoriesPath = () => '/repositories'

export const repoTransferTeamSuggestionsPath = (repo: Repository) =>
  `/${encodePart(`${repo.ownerLogin}/${repo.name}`)}/settings/transfer`

export const repoAbortTransferPath = (repo: Repository) =>
  `/${encodePart(`${repo.ownerLogin}/${repo.name}`)}/settings/abort_transfer`

export const repositoryImportsPath = () => '/new/import'

export const templateReposPath = () => `/repositories/new/templates`

export const repoOwnerItemsPath = () => '/repositories/forms/owner_items'

export const repoForkOwnerItemsPath = (repoId: number) => `/repositories/forms/fork_owner_items?repo_id=${repoId}`

export function repoOwnerDetailPath(owner: string): string
export function repoOwnerDetailPath(owner: string, action: 'transfer', repoId: number): string
export function repoOwnerDetailPath(owner: string, action?: 'transfer', repoId?: number): string {
  const base = `/repositories/forms/owner_detail`
  const params = new URLSearchParams({owner})

  if (action && repoId) {
    params.set('form', action)
    params.set('repo_id', repoId.toString())
  }

  return `${base}?${params.toString()}`
}

export const getContributorsPath = (repo: Repository) => `/repositories/${encodePart(repo.name)}/contributors/`

export const repoContributorsPath = (repo: Repository) =>
  `/${encodePart(repo.ownerLogin)}/${encodePart(repo.name)}/graphs/contributors`

export const repoAccessSettingsPath = (repo: Repository) =>
  `/${encodePart(repo.ownerLogin)}/${encodePart(repo.name)}/settings/access`

type PropertiesPathPrefix = 'organizations' | 'enterprises'

export function propertyDefinitionSettingsPath({
  pathPrefix,
  sourceName,
  propertyName,
}: {
  pathPrefix: PropertiesPathPrefix
  sourceName: string
  propertyName?: string
}) {
  const parts = ['', pathPrefix, encodePart(sourceName), 'settings']
  if (propertyName) {
    parts.push('custom-property')
    parts.push(encodePart(propertyName))
  } else {
    parts.push('custom-properties')
  }
  return parts.join('/')
}

export function customPropertyDetailsPath({
  pathPrefix,
  sourceName,
  propertyName,
}: {
  pathPrefix: PropertiesPathPrefix
  sourceName: string
  propertyName?: string
}) {
  const base = `/${pathPrefix}/${encodePart(sourceName)}/settings/custom-property`
  if (propertyName) {
    return `${base}/${encodePart(propertyName)}`
  } else {
    return base
  }
}

export function updateOrgPropertyValuesPath({org}: {org: string}) {
  return `/organizations/${encodePart(org)}/settings/custom-properties/values`
}

export function listOrgReposPropertyValuesPath({org}: {org: string}) {
  return `/organizations/${encodePart(org)}/settings/custom-properties/list-repos-values`
}

export const checkPropertyUsagePath = ({
  pathPrefix,
  sourceName,
  propertyName,
}: {
  pathPrefix: PropertiesPathPrefix
  sourceName: string
  propertyName: string
}) =>
  ['', pathPrefix, encodePart(sourceName), 'settings', 'custom-properties-usage', encodePart(propertyName)].join('/')

export const checkPropertyNamePath = ({sourceName, propertyName}: {sourceName: string; propertyName: string}) =>
  `/enterprises/${encodePart(sourceName)}/settings/property_definition_name_check/${encodePart(propertyName)}`

export function repositoryPropertiesSettingsPath({org, repo}: {org: string; repo: string}) {
  return `/${encodePart(`${org}/${repo}`)}/settings/custom-properties`
}

export function forkPath({owner, repo}: {owner: string; repo: string}) {
  return `/${encodePart(`${owner}/${repo}`)}/fork`
}

export function forksListPath({owner, repo}: {owner: string; repo: string}) {
  return `/${encodePart(`${owner}/${repo}`)}/forks`
}

export function newRepoPath({org}: {org?: string}) {
  if (org) {
    return `/organizations/${encodePart(org)}/repositories/new`
  }

  return `/new`
}

export function orgReposIndexPath({org}: {org: string}) {
  return `/orgs/${encodePart(org)}/repositories`
}

export function orgReposListPath({org}: {org: string}) {
  return `/orgs/${encodePart(org)}/repos_list`
}

export function orgTopicReposPath({topic, org}: {topic: string; org: string}) {
  return `/search?q=topic%3A${encodePart(topic)}+org%3A${encodePart(org)}&type=Repositories`
}

export function repoAttestationsIndexPath({
  repo,
  pagination = {before: null, after: null},
  perPage = 30,
}: {
  repo: Repository
  pagination?: {before?: string | null; after?: string | null}
  perPage?: number
}) {
  const parts = [repo.ownerLogin, repo.name, 'attestations']
  const params = []

  if (pagination) {
    if (pagination.after) {
      params.push(`after=${encodePart(pagination.after)}`)
    } else if (pagination.before) {
      params.push(`before=${encodePart(pagination.before)}`)
    }
  }

  // Don't add default values to the path/query-string
  if (perPage && perPage !== 30) {
    params.push(`per_page=${perPage}`)
  }

  return `/${parts.map(encodePart).join('/')}${params.length > 0 ? `?${params.join('&')}` : ''}`
}

export function repoAttestationShowPath({repo, attestationId}: {repo: Repository; attestationId: number | string}) {
  // Coerce attestationId to string as it's sometimes a number (SSR vs client-side hydration)
  return `/${[repo.ownerLogin, repo.name, 'attestations', attestationId.toString()].map(encodePart).join('/')}`
}

export function repoAttestationDownloadPath({repo, attestationId}: {repo: Repository; attestationId: number | string}) {
  // Coerce attestationId to string as it's sometimes a number (SSR vs client-side hydration)
  return `/${[repo.ownerLogin, repo.name, 'attestations', attestationId.toString(), 'download']
    .map(encodePart)
    .join('/')}`
}

export function branchesPath({repo}: {repo: Repository}) {
  return `/${[repo.ownerLogin, repo.name, 'branches'].map(encodePart).join('/')}`
}

export function tagsPath({repo}: {repo: Repository}) {
  return `/${[repo.ownerLogin, repo.name, 'tags'].map(encodePart).join('/')}`
}

export function orgOnboardingAdvancedSecurityPath({org}: {org: string}) {
  return `/orgs/${encodePart(org)}/organization_onboarding/advanced_security`
}

export function settingsOrgSecurityProductsPath({org, tip}: {org: string; tip?: string | null}) {
  let path = `/organizations/${encodePart(org)}/settings/security_products`
  if (tip) {
    path += `?tip=${tip}`
  }
  return path
}

export function settingsOrgSecurityConfigurationsNewPath({org}: {org: string}) {
  return `/organizations/${encodePart(org)}/settings/security_products/configurations/new`
}

export function settingsOrgSecurityConfigurationsCreatePath({org}: {org: string}) {
  return `/organizations/${encodePart(org)}/settings/security_products/configurations`
}

export function settingsOrgSecurityConfigurationsEditPath({org, id}: {org: string; id: number}) {
  return `/organizations/${encodePart(org)}/settings/security_products/configurations/edit/${id}`
}

export function settingsOrgSecurityConfigurationsUpdatePath({org, id}: {org: string; id: number}) {
  return `/organizations/${encodePart(org)}/settings/security_products/configurations/${id}`
}

export function settingsOrgSecurityProductsRepositories({org}: {org: string}) {
  return `/organizations/${encodePart(org)}/settings/security_products/repositories`
}

export function settingsOrgSecurityProductsRepositoriesConfigurationSummaryPath({org}: {org: string}) {
  return `/organizations/${encodePart(org)}/settings/security_products/repositories/apply_confirmation_summary`
}

export function settingsOrgSecurityProductsRepositoriesApplyPath({org, id}: {org: string; id: number}) {
  return `/organizations/${encodePart(org)}/settings/security_products/configuration/${id}/repositories`
}

export function settingsOrgSecurityProductsRepositoriesDeletePath({org}: {org: string}) {
  return `/organizations/${encodePart(org)}/settings/security_products/configuration/repositories`
}

export function settingsOrgSecurityProductsRepositoriesCount({org, id}: {org: string; id: number}) {
  return `/organizations/${encodePart(org)}/settings/security_products/configuration/${id}/repositories_count`
}

export function settingsOrgSecurityConfigurationsViewPath({org, tip}: {org: string; tip?: string | null}) {
  let path = `/organizations/${encodePart(org)}/settings/security_products/configurations/view`
  if (tip) {
    path += `?tip=${tip}`
  }
  return path
}

export function settingsOrgSecurityProductsRepositoriesGhasLicenseSummaryPath({org}: {org: string}) {
  return `/organizations/${encodePart(org)}/settings/security_products/repositories/advanced_security_license_summary`
}

export function settingsOrgSecurityProductsOptOutPath({org}: {org: string}) {
  return `/organizations/${encodePart(org)}/settings/security_products/opt_out`
}

export function settingsOrgSecurityProductsEnablementInProgressPath({org}: {org: string}) {
  return `/organizations/${encodePart(org)}/settings/security_products/in_progress`
}

export function settingsOrgSecurityProductsRefreshPath({org}: {org: string}) {
  return `/organizations/${encodePart(org)}/settings/security_products/refresh`
}

export function editDocsetPath({docsetId}: {docsetId: string}) {
  return `/copilot/docsets/${docsetId}/edit`
}

export function contactSalesRequest() {
  return '/contact-sales'
}

export const contactPath = () => '/contact'

export function repoSettingsSecurityAnalysisPath({repo}: {repo: Repository}) {
  return `/${encodePart(`${repo.ownerLogin}/${repo.name}`)}/settings/security_analysis`
}

export function dismissOrganizationNoticePath({org}: {org: string}) {
  return `/orgs/${encodePart(org)}/dismiss_notice`
}

export const enterprisePath: PathFunction<{slug: string}> = ({slug}) => `/enterprises/${slug}`

export function emailSubscriptionTopicsByEmailPath(email: string) {
  const emailParamString = new URLSearchParams({email})
  return `/settings/emails/subscriptions/topics_by_email?${emailParamString}`
}

export function emailSubscriptionTopicsByParamsPath<TopicsParams extends Record<string, string>>(
  topicSettingParams: TopicsParams,
) {
  const topicSettingParamString = new URLSearchParams(topicSettingParams)
  return `/settings/emails/subscriptions/topics_by_params?${topicSettingParamString}`
}

export function emailSubscriptionNewLinkPath() {
  return '/settings/emails/subscriptions/link-request/new'
}

export const userPRFileTreeVisibilitySettingPath: PathFunction<{login: string}> = ({login}) =>
  `/users/${encodePart(login)}/pulls/settings/file_tree_visibility`

export const codeScanningAlertPath: PathFunction<{owner: string; repo: string; alertNumber: number}> = ({
  owner,
  repo,
  alertNumber,
}) => `/${encodePart(owner)}/${encodePart(repo)}/security/code-scanning/${alertNumber}`

export function orgRepositoriesPath({owner, query}: {owner: string; query: string}) {
  return `/orgs/${encodePart(owner)}/repositories?q=${encodePart(query)}`
}
