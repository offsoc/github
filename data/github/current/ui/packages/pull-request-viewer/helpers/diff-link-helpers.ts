export interface PatchLinkProps {
  oid: string
  path: string
  status: string
}

export interface PullRequestLinkProps {
  headRepositoryNameWithOwner: string | undefined
  baseRepositoryNameWithOwner: string | undefined
  headRefName: string
  number?: number
}

/**
 * Path to view the blob page on the branch of current comparison
 */
export function diffBlobBranchPath(
  action: 'edit' | 'delete',
  patch: PatchLinkProps,
  pullRequest: PullRequestLinkProps,
): string {
  const {headRepositoryNameWithOwner, headRefName} = pullRequest
  const {path, status} = patch

  if (status === 'DELETED') {
    return diffBlobPath(patch, pullRequest)
  }

  if (!headRepositoryNameWithOwner) return ''

  return `/${headRepositoryNameWithOwner}/${action}/${headRefName}/${path}`
}

/**
 * Path to view the blob page at a specific SHA
 */
export function diffBlobPath(patch: PatchLinkProps, pullRequest: PullRequestLinkProps): string {
  // API handles deletion conditional logic for OID and PATH
  const {baseRepositoryNameWithOwner, headRepositoryNameWithOwner} = pullRequest
  const {oid, path, status} = patch

  const repoName = status === 'DELETED' ? baseRepositoryNameWithOwner : headRepositoryNameWithOwner

  if (!repoName) return ''
  return `/${repoName}/blob/${oid}/${path}`
}

/**
 * Path to edit the file in Hadron editor
 */
export function hadronEditorPath(patch: PatchLinkProps, pullRequest: PullRequestLinkProps): string {
  return `/${pullRequest.headRepositoryNameWithOwner}/pull/${pullRequest.number}/edit/file/${patch.path}`
}
