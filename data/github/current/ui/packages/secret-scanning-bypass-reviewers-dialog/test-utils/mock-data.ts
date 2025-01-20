import type {SecretScanningBypassReviewersDialogProps} from '../SecretScanningBypassReviewersDialog'

export function getSecretScanningBypassReviewersDialogProps(): SecretScanningBypassReviewersDialogProps {
  return {
    baseAvatarUrl: 'my.url',
    enabledBypassActors: [],
    initialSuggestions: [],
    addBypassReviewerPath: 'my.url',
    ownerId: 1,
    ownerScope: 'Repository',
    suggestionsUrl: 'bypass_reviewers',
  }
}
