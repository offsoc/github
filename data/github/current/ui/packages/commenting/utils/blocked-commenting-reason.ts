import {LABELS} from '../constants/labels'

export function blockedCommentingReason(
  isRepoArchived: boolean,
  isReferenceLocked: boolean,
  interactionLimitReason: string | null | undefined = null,
) {
  if (isRepoArchived) return LABELS.repoArchived
  if (isReferenceLocked) return LABELS.issueLockedToCollaborators
  if (interactionLimitReason) return interactionLimitReason

  return LABELS.canNotCommentOnIssue
}
